export type PathNode = { index: number, start: boolean};

export interface Route {
    dist: number,
    points: PathNode[],
    cps: { index: number, type: 'cp' | 'ring'}[]
}