import type { calcNode, calcPath } from "src/web-worker";
import type SearchSettings from "./SearchSettings";
import type { PathNode } from "./Node";
import type { Route } from "./Route";

export default interface SearchAlghorithm {
    (
        start: PathNode, finishes: PathNode[], paths: calcPath[], nodes: calcNode[], settings: SearchSettings, 
        onUpdate: (r:Route[]) => void,
        onProgress?: (percentage: number) => void
    ) : Route[]
}