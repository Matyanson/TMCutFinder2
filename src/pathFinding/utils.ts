import type { INode, PathNode } from "src/models/Node";

export const findStartPoint = (nodes: INode[]): PathNode => {
    const startNode = nodes.find(n => n.type == 'start');
    if(!startNode || !startNode.paths[0]) return;
    return {
        index: startNode.paths[0].index,
        start: startNode.paths[0].start
    }
}