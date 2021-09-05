<div class="generator">
    <Settings bind:settings />
    <button on:click={startWorker}>Re-route</button>
</div>

<script lang="ts">
import Settings from "./Settings.svelte";
import myWorker from "../../web-worker?worker";
import { nodes, paths } from "src/store";
import type { GenerateSettings } from "src/models/GenerateSettings";
import type { WorkerMessage } from "src/models/WorkerMessage";

let w: Worker;
let settings: GenerateSettings;

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