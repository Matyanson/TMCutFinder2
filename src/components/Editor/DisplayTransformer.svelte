<div bind:this={box}
class="box" class:cam={$toolIndex == 3} class:sel={$toolIndex == 0}
style={`--zoom: ${scale * 100}%; --offsetX: ${position.x}%; --offsetY: ${position.y}%`}
on:mousemove={handleMouseMove} on:mousedown={onMouseDown} on:mouseup={onMouseUp} on:wheel|nonpassive={handleWheel} on:contextmenu|preventDefault={()=>{}}
>
    <div class="wrap">
        <div class="display" bind:this={svg}>
            <slot/>
        </div>
    </div>
</div>
<svelte:window on:keydown={onKeyDown} on:keyup={onKeyUp}/>

<script lang="ts">
import type Coords from "src/models/Coords";
import { toolIndex } from "src/store";

import { sizeTracker } from "src/utils/dom";
import { addPoints } from "src/utils/functions";
import { onMount, setContext } from "svelte";

    //svg
    let box: Element;
    let svg: Element;
    let vh = 1080 / 100;
    let vw = 1920 / 100;
    let scale = 1;
    let position: Coords = {x: 0, y: 0};
    $: if(scale && svg) handleResize();
    
    //mouse
    let m: Coords = {x: 0, y: 0};
    let m1Down = false;
    let m2Down = false;

    //help
    let helpPoint: Coords = {x: 0, y: 0};
    let helpPosition: Coords = {x: 0, y: 0}

    const observer = sizeTracker();

    setContext('canvas', {
        getBox: () => box
    })

    onMount(() => {
        setup();
    })
    const setup = () => {
        if(svg){
            observer.init(svg, handleResize);
        }
    }

    const onKeyDown = (e: KeyboardEvent) => {
        switch(e.key){
            case '+':
                scale *= 1.1;
                break;
            case '-':
                scale /= 1.1;
                break;
            case 'ArrowRight':
                position.x -= 5 / scale;
                break;
            case 'ArrowLeft':
                position.x += 5 / scale;
                break;
            case 'ArrowUp':
                position.y += 5 / scale;
                break;
            case 'ArrowDown':
                position.y -= 5 / scale;
                break;
            case 'r':
                position = {x: 0, y: 0};
                scale = 1;
                break;
            case 'c':
                position = {x: 0, y: 0}; //100 * (1-scale) / (2*scale)
                break;
            case ' ':
                e.preventDefault();
                break;
        }
    }

    const onKeyUp = (e: KeyboardEvent) => {
        switch(e.key){
        }
    }

    const onMouseDown = (e: MouseEvent) => {
        e.button === 0 ?
        m1Down = true :
        m2Down = true;
        if($toolIndex == 3){
            helpPoint = {...m};
            helpPosition = {...position};
        }
    }
    const onMouseUp = (e: MouseEvent) => {
        e.button === 0 ?
        m1Down = false :
        m2Down = false;
    }

    const handleResize = () => {
        vh = svg.clientHeight / 100;
        vw = svg.clientWidth / 100;
    }

    const handleMouseMove = (e: MouseEvent) => {
        saveMousePosition(e.clientX, e.clientY);
        if($toolIndex == 3){
            if(m1Down){
                const dist = addPoints(m, {x: -helpPoint.x, y: -helpPoint.y});
                position = addPoints(helpPosition, dist);
            }
        }
    }
    const saveMousePosition = (mouseX: number, mouseY: number) => {
        m = {
            x: mouseX / vw,
            y: mouseY / vh
        }
    }
    const handleWheel = (e: WheelEvent) => {
        if($toolIndex == 3){
            e.preventDefault();
            e.deltaY < 0 ?
            scale *= 1.1 :
            scale /= 1.1;
        }
    }
</script>
<style>
    .box{
        position: relative;
        height: 100%;
        width: 100%;
        user-select: none;
        overflow: hidden;
        cursor:crosshair;
    }
    .box.cam{
        cursor:grabbing;
    }
    .box.sel{
        cursor: default;
    }
    .wrap{
        position: absolute;
        width: 100%;
        height: var(--zoom);
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-flow: column;
        justify-content: center;
        align-items: center;
    }
    .display{
        height: 100%;
        transform: translate(var(--offsetX), var(--offsetY));
    }
</style>