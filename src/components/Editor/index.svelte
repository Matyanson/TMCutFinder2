<div class="editor">
    {#if edit}
    <div class="tools">
        <button on:click={() => edit = false}>Routes</button>
        <Toolbar />
    </div>
    <div class="display">
        <div class="toolMenu">
            <ItemMenu />
        </div>
        <DisplayTransformer>
            <Canvas img={$imgSrc} />
        </DisplayTransformer>
    </div>
    {:else}
    <div class="tools">
        <button on:click={() => edit = true}>Edit</button>
        <h2>Route tools</h2>
    </div>
    <div class="display">
        <h2>Route view</h2>
    </div>
    {/if}
</div>
<script lang="ts">
import { imgSrc } from "src/store";
import Canvas from "./Canvas.svelte";
import DisplayTransformer from "./DisplayTransformer.svelte";
import ItemMenu from "./ItemMenu.svelte";
import Toolbar from "./Toolbar.svelte";

let edit: boolean = true;
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
    }
    .tools{
        display: flex;
        flex-flow: row;
        align-items: center;
        background: #25898f;
    }
    .toolMenu{
        position: absolute;
        top: 0;
        right: 0;
        z-index: 5;
    }
</style>