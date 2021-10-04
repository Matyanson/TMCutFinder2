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
    
    const startPoint: PathNode = findStartPoint(nodes);
    const finishIndex = nodes.findIndex(n => n.type == 'finish');
    const finishPoints = findFinishPoints(nodes);
    if(!startPoint || finishIndex < 0) return postMessage({ type: 'error', data: 'No start or finish node found'} as WorkerMessage);

    const searchProps = [startPoint, finishPoints, cachedPaths, cachedNodes, settings,
        (r) => {
            postMessage({type: "update", data: r});
        },
        (p) => {
            postMessage({type: 'progress', data: p})
        }
    ] as const;

    const routes = reverseSearch(...searchProps);
    postMessage({type: "finish", data: routes});
    //close();
}


//helper functions

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