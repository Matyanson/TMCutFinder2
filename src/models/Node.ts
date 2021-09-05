import type Coords from "./Coords";

export type PathNode = {
    index: number,
    start: boolean
}

export interface INode {
    coords: Coords,
    type?: 'cp' | 'ring' | 'normal' | 'start' | 'finish',
    paths: PathNode[]
}