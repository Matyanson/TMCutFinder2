import type { calcNode, calcPath } from "src/web-worker";
import type { GenerateSettings } from "./GenerateSettings";
import type { PathNode } from "./Node";
import type { Route } from "./Route";

export default interface SearchAlghorithm {
    (
        start: PathNode, finishes: PathNode[], paths: calcPath[], nodes: calcNode[], settings: GenerateSettings, 
        onUpdate: (r:Route[])=>void,
        onProgress?: (percentage: number)=>void
    ) : Route[]
}