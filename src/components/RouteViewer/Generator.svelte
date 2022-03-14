<div class="generator">
    <Settings bind:settings />
    <button on:click={startWorker}>Re-route</button>
    <button on:click={resetWorker}>Reset</button>
    {#if w}
    <ProgressBar bind:progress />
    {/if}
    add new route:
    <input type="text" bind:value={newRouteStr} /> <button on:click={addRoute} >add</button>
    <div class="routes">
    {#each manualRoutes as r, i}
        <RouteBtn selected={i == -(selected - 1)} route={r} on:click={() => selectRoute(-(i+1))} />
    {/each}
    </div>
    <div class="routes">
    {#each routes as r, i}
        <RouteBtn selected={i == selected} route={r} on:click={() => selectRoute(i)} />
    {/each}
    </div>
</div>

<script lang="ts">
import Settings from "./Settings.svelte";
import myWorker from "../../web-worker?worker";
import { nodes, paths } from "src/store";
import type SearchSettings from "src/models/SearchSettings";
import type { WorkerMessage } from "src/models/WorkerMessage";
import type { Route } from "src/models/Route";
import RouteBtn from "./RouteBtn.svelte";
import ProgressBar from "../ProgressBar.svelte";
import { strToRoute } from "src/utils/data";
import { getContext } from "svelte";
import type ReplayContext from "./ReplayContext";

let w: Worker;
let settings: SearchSettings;
let routes: Route[] = [];
let manualRoutes: Route[] = [];
let newRouteStr: string = "";
let selected: number;
let progress: number = 0;

const data: ReplayContext = getContext("replay");

$: {
    routes;
    selected = -1;
}

const selectRoute = (i) => {    //negative is manual
    console.log(i);
    selected = i;
    let activeRoute = i < 0 ? manualRoutes[-i-1] : routes[i];
    $data = { activeRoute, incomplete: false };
}

const addRoute = () => {
    const newRoute = strToRoute(newRouteStr);
    console.log(newRoute);
    manualRoutes = [...manualRoutes, newRoute];
    console.log(manualRoutes);
}

const startWorker = () => {
    console.log("starting woker");
    if(typeof(Worker) == "undefined" || w) return;

    w = new myWorker();
    w.postMessage({
        type: 'calculate',
        data: {
            paths: $paths,
            nodes: $nodes,
            settings
        }
    });
    w.onmessage = onMessage;
}
const resetWorker = () => {
    console.log('closing worker');
    if(w)
    w.terminate();
    w = undefined;
}
const onMessage = (e) => {
    const mess: WorkerMessage = e.data;
    switch (mess.type) {
        case 'update':
            routes = mess.data;
            $data.incomplete = false;
            break;
        case 'finish':
            routes = mess.data;
            resetWorker();
            $data.incomplete = false;
            break;
        case 'progress':
            progress = mess.data;
            break;
        case 'incomplete':
            $data = {
                activeRoute: mess.data,
                incomplete: true
            };
            break;
        default:
            console.log(mess.type, mess.data);
            break;
    }
}

</script>

<style>
    .routes{
        display: flex;
        flex-flow: row wrap;
    }
</style>