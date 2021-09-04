import type Coords from "./models/Coords";
import type { GenerateSettings } from "./models/GenerateSettings";
import type { INode } from "./models/Node";
import type { Path } from "./models/Path";
import type { PathNode, Route } from "./models/Route";
import type { WorkerMessage } from "./models/WorkerMessage";
import { getDist } from "./utils/functions";

//handle different commands
onmessage = async function(e){
    const mess: WorkerMessage = e.data;
    switch(mess.type){
        case "hello":
        console.log("world");
        this.postMessage({type: "hello", data: "hello world"});
        break;
        case "calculate":
            calculate(mess.data);
            break;
        default:
        console.log("undefined command");
        break;
    }
}

type MapData = {paths: Path[], nodes: INode[], settings: GenerateSettings}
type calcPath = Path & {dist: number, start: INode, end: INode};


const calculate = (data: MapData) =>{
    const {paths, nodes, settings} = data;
    const {limit, maxRouteLength} = settings;

    const calculatedPaths = calcPaths(paths, nodes).filter( p => p.dist > 0 );
    const checkpoints = nodes.filter(n => n.type == 'cp' || n.type == 'ring');

    //globals
    const totalDist = calculatedPaths.map(p => p.dist).reduce((total, cur) => total+cur);
    const distLimit = totalDist * maxRouteLength;
    const cpCount = checkpoints.length;
    const startPoint: PathNode = findStartPoint(nodes);
    if(!startPoint) return postMessage({ type: 'error', data: 'No start node found'} as WorkerMessage);

    let routesNumLimit = limit;
    let finalRoutes = [];


    const continueRoute = (route: Route) => {
        
    }

}


const calcPaths = (paths: Path[], nodes: INode[]): calcPath[] => {
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

const pointsToDist = (points: Coords[]) => {
    let dist: number = 0;
    for (let i = 1; i < points.length; i++) {
        const p = points[i];
        const prevP = points[i - 1];
        dist += getDist(prevP, p);
    }
    return dist;
}

const findNodes = (pathIndex: number, nodes: INode[]): INode[] => {
    const start = nodes.find(n => n.paths.some(p => p.index == pathIndex));
    const end = nodes.find(n => n.paths.some(p => p.index == pathIndex));
    return [start, end];
}

const findStartPoint = (nodes: INode[]): PathNode => {
    const startIndex = nodes.findIndex(n => n.type == 'start');
    if(startIndex < 0) return;
    return {
        index: startIndex,
        start: nodes[startIndex].paths[0].start
    }
}


export {};