import type Coords from "./models/Coords";
import type { GenerateSettings } from "./models/GenerateSettings";
import type { INode, PathNode } from "./models/Node";
import type { Path } from "./models/Path";
import type { Route } from "./models/Route";
import type { WorkerMessage } from "./models/WorkerMessage";
import reverseSearch from "./pathFinding/reverseSearch";
import { median, pointsToDist, random } from "./utils/functions";

//handle different commands
onmessage = async function(e){
    const mess: WorkerMessage = e.data;
    switch(mess.type){
        case 'calculate':
            calculate(mess.data);
            break;
        default:
            console.log("undefined command");
            break;
    }
}

type MapData = {paths: Path[], nodes: INode[], settings: GenerateSettings};
export type calcNode = INode & {cpNum: number};
export type calcPath = Path & {dist: number, start: calcNode, end: calcNode};


const calculate = (data: MapData) => {
    const {paths, nodes, settings} = data;
    const {limit, maxLengthMultiple} = settings;

    //cache data into the objects
    const checkpoints = nodes
    .map((n, i) => {
        return {...n, nodeIndex: i};
    })
    .filter(n => n.type == 'cp' || n.type == 'ring');
    const cachedNodes = nodes.map((n, i) => {
        return {
            ...n,
            paths: n.paths.reverse(),
            cpNum: checkpoints.findIndex(cp => cp.nodeIndex == i)
        }
    })
    const cachedPaths = calcPaths(paths, cachedNodes);

    //globals
    const totalDist = cachedPaths.map(p => p.dist).reduce((total, cur) => total+cur);
    
    const cpCount = checkpoints.length;
    const startPoint: PathNode = findStartPoint(nodes);
    const finishIndex = nodes.findIndex(n => n.type == 'finish');
    const finishPoints = findFinishPoints(nodes);
    if(!startPoint || finishIndex < 0) return postMessage({ type: 'error', data: 'No start or finish node found'} as WorkerMessage);
    const order = getPointOrder();
    
    let distLimit = totalDist * maxLengthMultiple;
    let routesNumLimit = limit;
    let finalRoutes = [];

    // continueRoute({dist: 0, points: [startPoint], cps: []});
    // postMessage({type: "finish", data: finalRoutes});

    const routes = reverseSearch(startPoint, finishPoints, cachedPaths, cachedNodes, settings,
        (r)=>{
            postMessage({type: "update", data: r});
        }
    );
    postMessage({type: "finish", data: routes});
    //close();


    function continueRoute(route: Route) {
        let { points, dist, cps = [] } = {...route};
        const curPoint = points[points.length -1];
        const curPath = cachedPaths[curPoint.index];
        if(!curPath) return;

        const curNode = curPoint.start ? curPath.start : curPath.end;
        if(!curNode) return;

        //recursive block
        dist += curPath.dist;
        if(dist > distLimit || points.length > paths.length * maxLengthMultiple || isRepeating(points)) return;

        //final point
        if(curNode.type == 'finish' && cps.length >= cpCount){
            addFinalRoute({points: points.slice(1), dist, cps});
            return;
        }

        let pointsFromHere: PathNode[] = nextpoints(curNode.paths, points);

        //calculate things
        pointsFromHere.push(...findNextPoints(curNode, points, cps));
        if(curNode.type == 'cp' || curNode.type == 'ring'){
            cps = addCP(curNode.cpNum, curNode.type, cps);
        }
        if(random(0, 10000000 / points.length) == 0){
            postMessage({type: 'progress', data: getPercentage(order, points)});
            if(finalRoutes.length == 0)
                postMessage({type: 'incomplete', data: {points: points.slice(1), dist, cps}});
        }

        pointsFromHere = filterNextPoints(pointsFromHere);
        
        //move to next point
        for(const p of pointsFromHere){
            const nextRoute = getNextRoute({points: [...points], cps: [...cps], dist}, p);
            continueRoute(nextRoute);
        }
    }

    function addFinalRoute(route) {
        let { dist = 0 } = route;
        //insert newRoute (insert sorting alghorithm)
        for(let i = 0; i <= finalRoutes.length; i++){
            if( !finalRoutes[i] || dist < finalRoutes[i].dist) { //if is shorter or last place
                //insert
                finalRoutes = insertIntoIndex(finalRoutes, i, route);
                postMessage({type: "update", data: finalRoutes});
                break;
            }
        }
        //trim if oversized
        finalRoutes = finalRoutes.slice(0, routesNumLimit);

        //set the distLimit to worst route
        if(settings.insertOnlyShorter || finalRoutes.length === routesNumLimit)
            distLimit = finalRoutes[finalRoutes.length-1].dist;
    }

    function nextpoints(paths: PathNode[], curPoints: PathNode[]): PathNode[] {
        const curPoint = curPoints[curPoints.length -1];
        return paths
        .filter(p => p.index != curPoint.index || curPoints.length < 2)    //don't go back unless start
        .map(p => {
            return {...p, start: !p.start};
        });
    }

    function findNextPoints(curNode: calcNode, curPoints: PathNode[], cps: Route['cps']) {
        const curPoint = curPoints[curPoints.length -1];
        const nextPoints: PathNode[] = [];
        if(['cp', 'ring'].includes(curNode.type) && !cps.some(cp => cp.num == curNode.cpNum)){
            const pathRepetition = getPathRepetition(curPoints);
            //go back
            if(settings.turnAround && pathRepetition < 3)
                nextPoints.push({index: curPoint.index, start: !curPoint.start});
            //ring respawn
            if(settings.ringRespawn && curNode.type == 'ring'){
                nextPoints.push(...getPointsFromRingRespawn(curPoints));
            }
        }
        return nextPoints;
    }

    function filterNextPoints(points: PathNode[]){
        const filtered = [];
        for(const p of points){
            const nextPath = cachedPaths[p.index];
            const wrongWay = () => nextPath.type == 'oneway' && p.start == true;
            //if not wrong way
            if(nextPath && !wrongWay()){
                filtered.push(p);
            }
        }
        return filtered;
    }

    function getNextRoute(route: Route, pointTo: PathNode) {
        const pointFrom = route.points[route.points.length -1];
        const newRoute = {...route};
        if(pointTo.index == pointFrom.index)
            newRoute.dist += settings.turnAroundPenalty;
        newRoute.points.push(pointTo);
        return newRoute;
    }

    function getPathRepetition(points: PathNode[]) {
        const curPoint = points[points.length -1];
        let res = 0;
        for (let i = points.length - 1; i > -1; i--) {
            if(points[i].index !== curPoint.index)
                break;
                res++;
        }
        return res;
    }

    function isRepeating(points: PathNode[]){
        let str: string = '';
        let pointsStr = points.slice().reverse().map(p => `${p.index}${p.start ? 's' : 'e'}`).join('');
        let count: number = 0;
        const sameHalves = (points: string) => {
            return points.substr(0, points.length / 2) == points.substr(points.length / 2);
        }
        const isPresent = (points: string, part: string) => {
            return points.slice(part.length - 1).includes(part);
        }
        for(const p of points.slice().reverse()){
            str += (`${p.index}${p.start ? 's' : 'e'}`);
            count++;
            if(count % 2 == 0 && count > 3 && isPresent(pointsStr, str))
                return true;
            if(points.length / 2 < count) return false;
        }
        return false;
    }
    function getPointsFromRingRespawn(points: PathNode[]) {
        for(let p of points.slice().reverse()) {
            const lastCP = cachedNodes.find(n => n.type == 'cp' && 
            n.paths.some(pathNode => pathNode.index == p.index && pathNode.start == p.start));

            if(lastCP){
                const pointsFromCP = lastCP.paths.map(p => { return {...p, start: !p.start}});
                return pointsFromCP;
            }
        }
        return [];
    }

    function addCP(cpNum: number, cpType: Route['cps'][0]['type'], cps: Route['cps']) {
        if(!cps.some(cp => cp.num == cpNum))
            cps.push({num: cpNum, type: cpType});
        return cps;
    }

    function getPointOrder(){
        const order: number[][] = [];

        continueSearch([startPoint], 0);

        return order;

        function continueSearch(points: PathNode[], depth: number = 0){
            const lastPoint = points[points.length -1];
            const curPath = cachedPaths[lastPoint.index];
            if(!curPath) return;
            const curNode = lastPoint.start ? curPath.start : curPath.end;
            if(!curNode) return;

            if(order[depth] == undefined) order[depth] = [];
            if(!order[depth].includes(lastPoint.index)) order[depth].push(lastPoint.index);

            const pointsFromHere = curNode.paths
            .filter(pathNode => 
                depth < 1 || 
                (lastPoint.index != pathNode.index && 
                !order[depth].includes(pathNode.index) &&
                !points.some(p => p.index == pathNode.index))
            )
            .map(p => {
                return {...p, start: !p.start};
            })
            for(const p of pointsFromHere){
                continueSearch([...points, p], depth + 1);
            }
        }
    }

    function getPercentage(order: number[][], points: PathNode[], precision: number = 1000) {
        precision = precision < points.length ? precision : points.length;
        let percentages = [];
        for(let i = 0; i < precision; i++){
            const pathIndex = points[i].index;
            const index = order[i]?.findIndex(n => n == pathIndex);
            const length = order[i]?.length;
            if(index > -1 && length > 0){
                const p = (index + 1) / length;
                percentages.push(p);
            }
        }
        const average = percentages.reduce((total, cur) => total + cur) / percentages.length;
        const med = median(percentages);
        const both = (average + med) / 2;
        return 100 * both;
    }
}


//helper functions
const insertIntoIndex = (arr: any[], index: number, el) => {
    return [...arr.slice(0, index), el, ...arr.slice(index)];
}

const calcPaths = (paths: Path[], nodes: calcNode[]): calcPath[] => {
    return paths.map((p, i) => {
        const [start, end] = findNodes(i, nodes);
        return {
            ...p,
            dist: pointsToDist(p.points),
            start,
            end
        }
    })
}

const findNodes = (pathIndex: number, nodes: calcNode[]): calcNode[] => {
    const start = nodes.find(n => n.paths.some(p => p.index == pathIndex && p.start == true));
    const end = nodes.find(n => n.paths.some(p => p.index == pathIndex && p.start == false));
    return [start, end];
}

const findStartPoint = (nodes: INode[]): PathNode => {
    const startNode = nodes.find(n => n.type == 'start');
    if(!startNode || !startNode.paths[0]) return;
    return {
        index: startNode.paths[0].index,
        start: startNode.paths[0].start
    }
}
const findFinishPoints = (nodes: INode[]): PathNode[] => {
    const finishes = nodes.filter(n => n.type == 'finish');
    if(!finishes) return;
    return finishes.map(f => {
        return {
            index: f.paths[0].index,
            start: f.paths[0].start
        }
    })
}

export {};