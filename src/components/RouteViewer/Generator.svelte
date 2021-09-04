<div class="generator">
    <Settings/>
    <button on:click={startWorker}>Re-route</button>
</div>

<script lang="ts">
import Settings from "./Settings.svelte";
import myWorker from "../../web-worker?worker";

let w: Worker;

const startWorker = () => {
    console.log("starting woker");
    if(typeof(Worker) == "undefined" || w) return;

    w = new myWorker();
    w.postMessage({
        type: 'hello',
        data: {
        }
    });
    w.onmessage = onMessage;
}
const onMessage = (e) => {
    const mess = e.data;
    switch (mess.type) {
        case 'hello':
            console.log(mess.data);
            break;

        default:
            break;
    }
}

</script>