import type { PathNode } from "./Node";

export interface Route {
    dist: number,
    points: PathNode[],
    cps: { num: number, type: 'cp' | 'ring'}[]
}