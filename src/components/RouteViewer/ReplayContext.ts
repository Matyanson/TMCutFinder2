import type { Route } from "src/models/Route"
import type { Writable } from "svelte/store";

type ReplayContext = Writable<ReplayData>;

export type ReplayData = {
    activeRoute: Route,
    incomplete: boolean
}
export default ReplayContext;