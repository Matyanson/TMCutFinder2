import { get, writable } from "svelte/store";
import type Coords from "./models/Coords";
import type { INode, PathNode } from "./models/Node";
import type { Path } from "./models/Path";
import { wStorage } from "./utils/writableStores";


export const toolIndex = writable(0);

export const paths = createPaths();
export const nodes = createNodes();

export const selectedPath = paths.selected;
export const selectedNode = nodes.selected;
export const pathType = paths.type;
export const nodeType = nodes.type;



function createPaths() {
    const selected = writable(-1);
    const type = writable<Path['type']>('normal')
    const {subscribe, set, update} = wStorage<Path[]>('paths', []);

    return {
        subscribe,
        selected,
        type,
        add: function (newPath: Path = {type: get(type), points: []}): number {
            update(old => {
                const last = old[old.length - 1]    
                if(last && last.points.length < 1)          //use empty paths
                    return [...old.slice(0, old.length - 1), newPath];
                return [...old, newPath];
            })
            return get(paths).length -1;
        },
        addNew: function (newPath: Path = {type: get(type), points: []}) {
            const objEqual = (a, b) => Object.entries(a).sort()+'' == Object.entries(b).sort()+'';
            //prevent from storing empty paths
            const curPath = get(paths)[get(selected)];
            if(curPath && objEqual(curPath, newPath)) return get(selected);
            const newIndex = this.add(newPath);
            selected.set(newIndex);
            return newIndex;
        },
        addPoints: function (index: number, points: Coords | Coords[]) {
            update(old => {
                old[index].points = [...old[index].points, ...[].concat(points)];
                return old;
            })
        },
        edit: function (index: number, path: Path) {
            update(old => {
                old[index] = path;
                return old;
            })
        },
        delete: function (index: number) {
            if(get(paths)[index] == undefined) return;
            update(old => [...old.slice(0, index), ...old.slice(index + 1)])    //delete 1 path from array
            nodes.deletePathNodes(index);
            nodes.shiftPathIndex(index + 1, -1);
        },
        split: function (index: number, pointIndex: number): number {
            const chosenPath = get(paths)[index];
            const splitPoints = [chosenPath.points.slice(0, pointIndex + 1), chosenPath.points.slice(pointIndex)];
            update(old => {
                old[index].points = splitPoints[1];
                return old;
            })
            const newIndex =  this.add({ type: get(type), points: splitPoints[0]});
            nodes.changePathIndex(index, newIndex, true);
            return newIndex;
        },
        reset: () => set([])
    }
}

function createNodes() {
    const selected = writable(-1);
    const type = writable<INode['type']>('normal')
    const {subscribe, set, update} = wStorage<INode[]>('nodes', []);

    return {
        subscribe,
        selected,
        type,
        add: function (newNode: INode): number {
            update(old => {
                const n = [...old, newNode];
                return n;
            })
            return get(nodes).length -1;
        },
        addNew: function (coords: Coords, pathIndex: number, nodeType: INode['type'] = get(type)) {
            const pointIndex = get(paths)[pathIndex].points.findIndex(p => p == coords);
            if(pointIndex < 0) return -1;
            const newPathIndex = paths.split(pathIndex, pointIndex);
            return this.add({
                coords,
                type: nodeType,
                paths: [
                    { index: pathIndex, start: true },
                    { index: newPathIndex, start: false }
                ]
            })
        },
        addPaths: function (index: number, paths: PathNode | PathNode[]) {
            update(old => {
                old[index].paths = [...old[index].paths, ...[].concat(paths)];
                return old;
            })
        },
        deletePathNodes: function (pathIndex: number) {
            update(old => {
                const n = old.map(n => {
                    return {
                        ...n,
                        paths: n.paths.filter(p => p.index != pathIndex)
                    }
                })
                return n.filter(node => node.paths.length > 0);
            })
        },
        shiftPathIndex: function (from: number, increment: number) {
            update(old => {
                return old.map(n => {
                    return {...n, paths: n.paths.map(p => {
                        return p.index >= from ? {...p, index: p.index + increment} : p;
                    })}
                })
            })
        },
        changePathIndex: function (targetIndex: number, newIndex: number, isStart: boolean = false, isEnd: boolean = false) {
            update(old => {
                return old.map( node => {
                    return {
                        ...node,
                        paths: node.paths.map( p => {
                            const isTarget = () => p.index == targetIndex && (isStart && p.start || isEnd && !p.start);
                            return isTarget() ?
                                { ...p, index: newIndex} :
                                p;
                        })
                    }
                })
            })
        },
        reset: () => set([])
    }
}