import type Coords from "./Coords";

export interface Path {
    type?: 'oneway' | 'normal'
    points: Coords[]
}