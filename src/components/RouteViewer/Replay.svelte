<div class="container">
    <div class="toolbar">
        Manual: <input type="checkbox" bind:checked={anim.manual} on:change={playPause}/>
        {#if anim.manual}
        <input type='range' step="0.01" min='0' max='100' bind:value={anim.percentage} /> {anim.percentage}
        {:else}
        <input type='range' step="0.01" min='0' max='20' bind:value={anim.speed} /> {anim.speed}
        {/if}
    </div>
    <div class="display">
        <DisplayTransformer>
            <Display bind:route bind:percentage={anim.percentage} />
        </DisplayTransformer>
    </div>
</div>

<script lang="ts">
    import type { Route } from "src/models/Route";
    import DisplayTransformer from "../Editor/DisplayTransformer.svelte";
    import Display from "./Display.svelte";

    export let route: Route;
    
    let interval;
    const anim = {
        manual: true,
        fps: 25,
        speed: 1,
        percentage: 0
    }

    const playPause = () => {
        anim.manual ? stopAnim() : startAnim();
    }
    const startAnim = () => {
        const delay = 1000 / anim.fps;
        interval = setInterval(nextFrame, delay);
    }
    const stopAnim = () => {
        clearInterval(interval);
    }
    const nextFrame = () => {
        const frames = anim.speed / anim.fps;
        anim.percentage += frames;
        if(anim.percentage > 100)
            anim.percentage = 0;
    }
</script>

<style>
.container{
    height: 100%;
    width: 100%;
    display: flex;
    flex-flow: column;
}
.toolbar{
    background: #fff;
}
.toolbar input{
    margin: 0;
    width: 100%;
}
.display{
    flex: 1;
}
</style>