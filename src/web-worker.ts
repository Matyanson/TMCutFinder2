import type Coords from "./models/Coords";
import type { GenerateSettings } from "./models/GenerateSettings";
import type { INode, PathNode } from "./models/Node";
import type { Path } from "./models/Path";
import type { Route } from "./models/Route";
import type { WorkerMessage } from "./models/WorkerMessage";
import { getDist, pointsToDist } from "./utils/functions";

//handle different commands
onmessage = async function(e){
    const mess: WorkerMessage = e.data;
    switch(mess.type){
        case "calculate":
            calculate(mess.data);
            break;
        default:
            console.log("undefined command");
            break;
    }
}

type MapData = {paths: Path[], nodes: INode[], settings: GenerateSettings};
type calcNode = INode & {cpNum: number};
type calcPath = Path & {dist: number, start: calcNode, end: calcNode};


const calculate = (data: MapData) =>{
    const {paths, nodes, settings} = data;
    const {limit, maxRouteLength} = settings;

    //cache data into the objects
    const checkpoints = nodes
    .map((n, i) => {
        return {...n, nodeIndex: i};
    })
    .filter(n => n.type == 'cp' || n.type == 'ring');
    const cachedNodes = nodes.map((n, i) => {
        return {
            ...n,
            cpNum: checkpoints.findIndex(cp => cp.nodeIndex == i)
        }
    })
    const cachedPaths = calcPaths(paths, cachedNodes);

    //globals
    const totalDist = cachedPaths.map(p => p.dist).reduce((total, cur) => total+cur);
    
    const cpCount = checkpoints.length;
    const startPoint: PathNode = findStartPoint(nodes);
    if(!startPoint) return postMessage({ type: 'error', data: 'No start node found'} as WorkerMessage);
    
    let distLimit = totalDist * maxRouteLength;
    let routesNumLimit = limit;
    let finalRoutes = [];

    continueRoute({dist: 0, points: [startPoint], cps: []});

    postMessage({type: "finish", data: finalRoutes});
    close();


    function continueRoute(route: Route) {
        let { points, dist, cps = [] } = {...route};
        const curPoint = points[points.length -1];
        const curPath = cachedPaths[curPoint.index];
        if(!curPath) return;

        const curNode = curPoint.start ? curPath.start : curPath.end;
        if(!curNode) return;

        const pointsFromHere: PathNode[] = curNode.paths
        .filter(p => p.index != curPoint.index || points.length < 2)    //don't go back unless start
        .map(p => {
            return {index: p.index, start: !p.start};
        });

        //calculate things
        if(curNode.type == 'cp' || curNode.type == 'ring'){
            if(!cps.some(cp => cp.num == curNode.cpNum)){
                cps.push({num: curNode.cpNum, type: curNode.type});
            }
        }
        dist += curPath.dist;

        //recursive block
        if(dist > distLimit) return;

        //final point
        if(curNode.type == 'finish' && cps.length >= cpCount){
            addFinalRoute(route);
            return;
        }
        
        //move to next point
        pointsFromHere.forEach(p => {
            const nextPath = cachedPaths[p.index];
            const wrongWay = () => nextPath.type == 'oneway' && p.start == true;
            //if not wrong way
            if(nextPath && !wrongWay()){
                const nextPoints = [...points, p];
                const nextCps = [...cps];
                continueRoute({points: nextPoints, cps: nextCps, dist});
            }
        })
    }

    function addFinalRoute(route) {
        console.log('add');
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
        //if(finalRoutes.length === routesNumLimit)
        distLimit = finalRoutes[finalRoutes.length-1].dist;
    }
}


const insertIntoIndex = (arr: any[], index: number, el) => {
    return [...arr.slice(0, index), el, ...arr.slice(index + 1)];
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


export {};