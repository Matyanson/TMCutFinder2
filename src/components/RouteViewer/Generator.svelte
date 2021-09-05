<div class="generator">
    <Settings bind:settings />
    <button on:click={startWorker}>Re-route</button>

    <div class="routes">
    {#each routes as r, i}
        <div class:selected={i == selected} class="route" on:click={() => selectRoute(i)}>
            <div class="dist">{Math.floor(r.dist)}</div>
            <div class="cps">
                {#each r.cps as cp}
                    <div>{cp.num}</div>
                {/each}
            </div>
        </div>
    {/each}
    </div>
    <input type='range' min='0' max='10000' bind:value={percentage} style="width: 100%;" /> {percentage / 100}
</div>

<script lang="ts">
import Settings from "./Settings.svelte";
import myWorker from "../../web-worker?worker";
import { nodes, paths } from "src/store";
import type { GenerateSettings } from "src/models/GenerateSettings";
import type { WorkerMessage } from "src/models/WorkerMessage";
import type { Route } from "src/models/Route";

let w: Worker;
let settings: GenerateSettings;
let routes: Route[] = [];
let selected: number;

export let percentage = 0;
export let route: Route = null;
$: route = routes[selected] ?? {dist:0, points:[], cps:[]};

const selectRoute = (i) => {
    selected = i;
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
const onMessage = (e) => {
    const mess: WorkerMessage = e.data;
    switch (mess.type) {
        case 'update':
            console.log(mess.data);
            routes = mess.data;
            break;
        case 'finish':
            w.terminate();
            w = undefined;
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
        flex-flow: row;

    }
    .route{
        background: #0f5f8d;
        color: #fff;
        padding: 5px;
    }
    .route.selected{
        background: #3b9bd3;
        color: #000;
    }
    .cps{
        display: flex;
        flex-flow: row;
    }
</style>