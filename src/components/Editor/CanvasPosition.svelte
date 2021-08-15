<div bind:this={box}
class="box" class:cam={$toolIndex == 3} class:sel={$toolIndex == 0}
style={`--zoom: ${scale * 100}%; --offsetX: ${position.x}%; --offsetY: ${position.y}%`}
on:mousemove={handleMouseMove} on:mousedown={onMouseDown} on:mouseup={onMouseUp} on:wheel={handleWheel} on:contextmenu|preventDefault={()=>{}} on:wheel|nonpassive={(e)=>{ if($toolIndex == 3) e.preventDefault();}}
>
    <div class="wrap">
        <div class="canvas" bind:this={svg}>
            <Canvas m={m} unit={unit} />
            <img alt="screenshot of map" src="https://i.imgur.com/31jOVzP.jpeg"/>
        </div>
    </div>
</div>
<svelte:window on:keydown={onKeyDown} on:keyup={onKeyUp}/>

<script lang="ts">
import type Coords from "src/models/Coords";
import { toolIndex } from "src/store";

import { sizeTracker } from "src/utils/dom";
import { onMount } from "svelte";
import Canvas from "./Canvas.svelte";

    //svg
    let box: Element;
    let svg: Element;
    let aspect_ratio = 16/9;
    let unit = 1080 / 100 //1% of VH
    let scale = 1;
    let position: Coords = {x: 0, y: 0};
    
    //mouse
    let m: Coords = {x: 0, y: 0};
    let m1Down = false;
    let m2Down = false;

    //help
    let helpPoint: Coords = {x: 0,y: 0};

    const observer = sizeTracker();

    onMount(() => {
        setup();
    })
    const setup = () => {
        box = box;
        if(svg){
            const height = svg.getBoundingClientRect().height;
            const width = svg.getBoundingClientRect().width;
            aspect_ratio =  width / height;
            unit = height / 100;

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
        switch($toolIndex){
            case 3:
            helpPoint = {...m};
                break;
        }
    }
    const onMouseUp = (e: MouseEvent) => {
        e.button === 0 ?
        m1Down = false :
        m2Down = false;
    }

    const handleResize = () => {
        unit = svg.clientHeight / 100;
    }
    const handleMouseMove = (e: MouseEvent) => {
        saveMousePosition(e.clientX, e.clientY);
        if($toolIndex == 3){
            if(m1Down){
                const distX = m.x - helpPoint.x;
                const distY = m.y - helpPoint.y;
                position.x += distX;
                position.y += distY;
            }
        }

        
    }
    const saveMousePosition = (mouseX: number, mouseY: number) => {
        const svgRect = svg.getBoundingClientRect();
        m = {
            x: (mouseX - svgRect.left) / unit,
            y: (mouseY - svgRect.top) / unit
        }
    }
    const handleWheel = (e: WheelEvent) => {
        if($toolIndex == 3){
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
    .canvas{
        position: relative;
        height: 100%;
        transform: translate(var(--offsetX), var(--offsetY));
        background-color: aqua;
    }
    img{
        display: block;
        height: 100%;
        user-select: none;
    }
</style>