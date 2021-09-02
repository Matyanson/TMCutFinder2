<div class="toolbar">
    <div style="color:white">{$selectedPath > -1 ? $selectedPath : ($selectedNode > -1 ? $selectedNode : -1)}</div>
    <div class="tools">
        <KeyBtn key='q' on={$toolIndex == 0}  onSwitch={() => $toolIndex = 0}>Select</KeyBtn>
        <KeyBtn key='w' on={$toolIndex == 1} onSwitch={() => $toolIndex = 1}>Path</KeyBtn>
        <KeyBtn key='e' on={$toolIndex == 2} onSwitch={() => $toolIndex = 2}>Node</KeyBtn>
        <KeyBtn key=' ' on={$toolIndex == 3} onSwitch={switchCamera} keyLabel='space'>Camera</KeyBtn>
    </div>
    <div class="options">
    {#if $toolIndex == 1}
        <KeyBtn key='a' onPress={() => paths.addNew()}>Add</KeyBtn>
        <KeyBtn key='s' on={$pathType == 'normal'} onPress={() => $pathType = 'normal'}>Normal</KeyBtn>
        <KeyBtn key='d' on={$pathType == 'oneway'} onPress={() => $pathType = 'oneway'}>1Way</KeyBtn>
    {:else if $toolIndex == 2}
        <KeyBtn key='a' on={$nodeType == 'start'} onPress={() => $nodeType = 'start'}>Start</KeyBtn>
        <KeyBtn key='s' on={$nodeType == 'cp'} onPress={() => $nodeType = 'cp'}>CP</KeyBtn>
        <KeyBtn key='d' on={$nodeType == 'ring'} onPress={() => $nodeType = 'ring'}>RingCP</KeyBtn>
        <KeyBtn key='f' on={$nodeType == 'finish'} onPress={() => $nodeType = 'finish'}>Finish</KeyBtn>
        <KeyBtn key='g' on={$nodeType == 'normal'} onPress={() => $nodeType = 'normal'}>Normal</KeyBtn>
    {/if}
    </div>
</div>
<svelte:window on:keydown={onKeyDown} />

<script lang="ts">
import {  nodes, nodeType, paths, pathType, selectedNode, selectedPath, toolIndex } from 'src/store'
import KeyBtn from '../KeyBtn.svelte';
    let lastTool = 0;
    
    const switchCamera = (active: boolean) => {
        if(active){
            if($toolIndex != 3) lastTool = $toolIndex;
                $toolIndex = 3;
        } else {
            $toolIndex = lastTool;
        }
    }

    const onKeyDown = (e: KeyboardEvent) => {
        switch(e.key){
            case 'k':
                paths.reset();
                nodes.reset();
                break;
        }
    }
</script>

<style>
    .toolbar{
        display: flex;
        flex-flow: row;
        padding: 10px;
    }
    .tools{
        margin-right: 50px;
    }
</style>