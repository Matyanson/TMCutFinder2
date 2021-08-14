<div class="box"><!--to keep size relative to this, not the outside wrap-->
    <div class="wrap" style={`--zoom: ${scale * 100}%; --offsetX: ${position.x}%; --offsetY: ${position.y}%`}>
        <svg bind:this={svg} on:contextmenu|preventDefault={()=>{}} on:wheel|nonpassive|preventDefault={()=>{}}>
            <marker id="arrow" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 3 L 0 6 z" fill="#ddd"/>
            </marker> 
            <text x={'0%'} y={'0%'}>{m.x +':'+ m.y}</text> 
            <circle cx={'10%'} cy={'10%'} r={10} fill={'white'} />
            <circle cx={'50%'} cy={'50%'} r={10} fill={'white'} />
            <circle cx={'-10%'} cy={'10%'} r={10} fill={'black'} />
        </svg>
            <img alt="screenshot of map" src="https://i.imgur.com/31jOVzP.jpeg"/>
    </div>
</div>
<svelte:window on:keydown={onKeyDown} on:keyup={onKeyUp} on:mousemove={handleMouseMove} on:mousedown={onMouseDown} on:mouseup={onMouseUp} on:wheel={handleWheel}/>

<script lang="ts">
import type Coords from "src/models/Coords";

import { sizeTracker } from "src/utils/dom";
import { onMount } from "svelte";

    //svg
    let svg: SVGElement;
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


    //keyboard
    let space = false;

    const observer = sizeTracker();

    onMount(() => {
        setup();
    })
    const setup = () => {
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
                space = true;
                break;
        }
    }

    const onKeyUp = (e: KeyboardEvent) => {
        switch(e.key){
            case ' ':
                space = false;
                break;
        }
    }

    const onMouseDown = (e: MouseEvent) => {
        e.button === 0 ?
        m1Down = true :
        m2Down = true;
        helpPoint = {...m};
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
        if(space){
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
        if(space){
            e.deltaY < 0 ?
            scale *= 1.1 :
            scale /= 1.1;
        }
    }
</script>
<style>
    .box{
        display: flex;
        height: 100%;
        width: 100%;
        flex-flow: column;
        justify-content: center;
        align-items: center;
        user-select: none;
    }
    .wrap{
        position: relative;
        height: var(--zoom);
        width: var(--zoom);
        transform: translate(var(--offsetX), var(--offsetY));
        background-color: aqua;
        
    }
    svg{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%; 
        height: 100%;
        overflow: visible;
    }
    img{
        display: block;
        height: 100%;
        width: 100%;
        object-fit: contain;
    }
</style>