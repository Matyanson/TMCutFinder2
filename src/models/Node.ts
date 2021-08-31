import type Coords from "./Coords";

export interface PathNode {
    index: number,
    start: boolean
}

export interface INode {
    coords: Coords,
    type?: 'cp' | 'ring' | 'normal' | 'start' | 'finish',
    paths: PathNode[]
}