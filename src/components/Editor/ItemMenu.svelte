<div class="menu">
{#if $selectedNode > -1}
    <div class="">{`node: ${$selectedNode}`}</div>
    <div class="">{`${$nodeType}`}</div>
    <div class="types">
    {#each nodeTypes as type}
        <button on:click={() => nodes.edit($selectedNode, {...$nodes[$selectedNode], type})}>{type}</button>
    {/each}
    </div>
    <button on:click={() => {}}>delete</button>
{:else if $selectedPath > -1}
    <div class="">{`path: ${$selectedPath}`}</div>
    <div class="">{`${$pathType}`}</div>
    <div class="types">
    {#each pathTypes as type}
        <button on:click={() => paths.edit($selectedPath, {...$paths[$selectedPath], type})}>{type}</button>
    {/each}
    </div>
    <button on:click={() => paths.delete($selectedPath)}>delete</button>
{/if}
</div>

<script lang="ts">
import { nodes, nodeType, paths, pathType, selectedNode, selectedPath } from "src/store";
import type { INode } from "src/models/Node";
import type { Path } from "src/models/Path";

const nodeTypes: INode["type"][] = ['normal', 'cp', 'ring', 'start', 'finish'];
const pathTypes: Path["type"][] = ['normal', 'oneway'];

</script>

<style>
    .menu{
        background: #ffe17e;
        padding: 5px;
        border-radius: 5px;
    }
</style>