import type Coords from "./Coords";

export interface Path {
    points: Coords[],
    type?: 'oneway' | 'normal'
}