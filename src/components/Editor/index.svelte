<div class="editor">
    <div class="titleBar">
        <span>{edit ? 'Editor' : 'Generator'}</span>
        <button on:click={() => edit = !edit}>{edit ? 'Generator' : 'Editor'}</button>
        <button on:click={() => saveMap('map', $imgSrc, $paths, $nodes)}>saveMap</button>
        <input type="file" accept='.dat' on:change={handleFileChange} />
        <button class="exit" on:click={() => imgSrc.set('')}>X</button>
    </div>
    {#if edit}
    <Toolbar />
    <div class="display">
        <div class="toolMenu">
            <ItemMenu />
        </div>
        <DisplayTransformer>
            <Canvas img={$imgSrc} />
        </DisplayTransformer>
    </div>
    {:else}
    <div class="display">
        <RouteViewer />
    </div>
    {/if}
</div>
<script lang="ts">
import { imgSrc, nodes, paths } from "src/store";
import Canvas from "./Canvas.svelte";
import RouteViewer from "src/components/RouteViewer/index.svelte";
import DisplayTransformer from "./DisplayTransformer.svelte";
import ItemMenu from "./ItemMenu.svelte";
import { loadMap, saveMap } from "./map";
import Toolbar from "./Toolbar.svelte";

let edit: boolean = true;


const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    loadMap(target.files[0]);
}
</script>

<style>
    .editor{
        width: 100%;
        height: 100%;
        display: flex;
        flex-flow: column;
        background: #155053;
        user-select: none;
        -webkit-user-drag: none;
    }
    .display{
        flex: 1;
        position: relative;
        overflow-y: auto;
    }
    .titleBar{
        display: flex;
        flex-flow: row;
        align-items: center;
        background: #25898f;
    }
    .exit{
        margin-left: auto;
        background: #f03b3b;
        color: whitesmoke;
    }
    .toolMenu{
        position: absolute;
        top: 0;
        right: 0;
        z-index: 5;
    }
</style>