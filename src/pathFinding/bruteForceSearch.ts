import type { PathNode } from "src/models/Node";
import type { Route } from "src/models/Route";
import type SearchAlghorithm from "src/models/SearchAlghoritm"
import { median, random } from "src/utils/functions";
import type { calcNode } from "src/web-worker";

let x: SearchAlghorithm;
export default x = (start, finishes, paths, nodes, settings, 
    onUpdate: (r:Route[])=>void = ()=>{},
    onProgress: (percentage: number)=>void = ()=>{}
): Route[] => {

    const checkpoints = nodes
    .map((n, i) => {
        return {...n, nodeIndex: i};
    })
    .filter(n => n.type == 'cp' || n.type == 'ring');
    const totalDist = paths.map(p => p.dist).reduce((total, cur) => total+cur);
    const cpCount = checkpoints.length;
    const {limit, maxLengthMultiple} = settings;
    
    let distLimit = totalDist * maxLengthMultiple;
    let routesNumLimit = limit;
    let finalRoutes = [];
    
    const order = getPointOrder();
    

    continueRoute({dist: 0, points: [start], cps: []});

    return finalRoutes;

    function continueRoute(route: Route) {
        let { points, dist, cps = [] } = {...route};
        const curPoint = points[points.length -1];
        const curPath = paths[curPoint.index];
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
            onProgress(getPercentage(order, points));
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
                onUpdate(finalRoutes);
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
            const nextPath = paths[p.index];
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
            const lastCP = nodes.find(n => n.type == 'cp' && 
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

    function getPointOrder(){
        const order: number[][] = [];

        continueSearch([start], 0);

        return order;

        function continueSearch(points: PathNode[], depth: number = 0){
            const lastPoint = points[points.length -1];
            const curPath = paths[lastPoint.index];
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

    const insertIntoIndex = (arr: any[], index: number, el) => {
        return [...arr.slice(0, index), el, ...arr.slice(index)];
    }
}