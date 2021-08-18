<div class="toolbar">
    <div class="tools">
        <KeyBtn on={$toolIndex == 0} key='q' onSwitch={() => $toolIndex = 0}>Select</KeyBtn>
        <KeyBtn on={$toolIndex == 1} key='w' onSwitch={() => $toolIndex = 1}>Path</KeyBtn>
        <KeyBtn on={$toolIndex == 2} key='e' onSwitch={() => $toolIndex = 2}>Node</KeyBtn>
        <KeyBtn on={$toolIndex == 3} key=' ' onSwitch={switchCamera} keyLabel='space'>Camera</KeyBtn>
    </div>
    <div class="options">
    {#if $toolIndex == 1}
        <KeyBtn key='a' onPress={() => paths.addNew()}>Add</KeyBtn>
        <KeyBtn key='s' onPress={() => {}}>Normal</KeyBtn>
        <KeyBtn key='d' onPress={() => {}}>1Way</KeyBtn>
    {:else if $toolIndex == 2}
        <KeyBtn key='a' onPress={() => {}}>Normal</KeyBtn>
        <KeyBtn key='s' onPress={() => {}}>CP</KeyBtn>
        <KeyBtn key='d' onPress={() => {}}>RingCP</KeyBtn>
    {/if}
    </div>
</div>
<svelte:window on:keydown={onKeyDown} />

<script lang="ts">
    import { paths, toolIndex } from 'src/store'
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
            case 'd':
                paths.reset();
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