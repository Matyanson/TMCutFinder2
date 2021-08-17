<div class="canvas" bind:this={svg}>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <marker id="arrow" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 3 L 0 6 z" fill="#ddd"/>
        </marker>
        {#each $paths as path}
            <polyline class='path' points={pointsToPath(path.points)} vector-effect="non-scaling-stroke"  stroke-width='10px' fill='none' stroke={'#1b36ca'}/>
        {/each}
        <polyline class='path' points='0,0 0,100 100,100 100,0' vector-effect="non-scaling-stroke"  stroke-width='10px' fill='none' stroke={'#1b36ca'}/>
    </svg>
    <svg>
        <circle cx={'50%'} cy={'50%'} r={10} fill={'white'} />
        <text x={'0%'} y={'100%'} fill={'white'}>{`${Math.floor(m.x)}:${Math.floor(m.y)}`}</text>
        <circle cx={'10%'} cy={'10%'} r={10} fill={'white'} />
        <circle cx={'50%'} cy={'50%'} r={10} fill={'white'} />
        <circle cx={'-10%'} cy={'10%'} r={10} fill={'black'} />           
    </svg>
    <img alt="screenshot of map" src="https://i.imgur.com/31jOVzP.jpeg"/>
</div>
<svelte:window on:mousedown={onMouseDown} on:mouseup={onMouseUp} on:wheel={()=>handleResize()} />

<script lang="ts">
import type Coords from "src/models/Coords";
import { sizeTracker } from "src/utils/dom";
import { getContext, onMount } from "svelte";

    const context: any = getContext('canvas');

    //svg
    let svg: Element;
    let outerDiv: Element | Window;
    let aspect_ratio = 16/9;
    let unit = 1080 / 100 //1% of VH

    //mouse
    let m: Coords = {x: 0, y: 0};
    let m1Down = false;
    let m2Down = false;

    const observer = sizeTracker();

    onMount(() => {
        if(context && context.getBox){
            const box: Element = context.getBox();
            outerDiv = box;
        } else {
            outerDiv = window;
        }
        if(svg){
            const svgRect = svg.getBoundingClientRect();
            aspect_ratio =  svgRect.width / svgRect.height;
            handleResize();

            observer.init(svg, handleResize);
        }
        outerDiv.addEventListener('mousemove', onMouseMove);
    })
    
    const onMouseDown = (e: MouseEvent) => {
        e.button === 0 ?
        m1Down = true :
        m2Down = true;
    }
    const onMouseUp = (e: MouseEvent) => {
        e.button === 0 ?
        m1Down = false :
        m2Down = false;
    }
    const onMouseMove = (e: MouseEvent) => {
        saveMousePosition(e.clientX, e.clientY);
    }
    const handleResize = () => {
        unit = svg.clientHeight / 100;
    }

    const saveMousePosition = (mouseX: number, mouseY: number) => {
        const svgRect = svg.getBoundingClientRect();
        m = {
            x: (mouseX - svgRect.left) / unit,
            y: (mouseY - svgRect.top) / unit
        }
    }
</script>

<style>
    .canvas{
        position: relative;
        height: 100%;
        background-color: aqua;
    }
    svg{
        user-select: none;
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
        user-select: none;
        -webkit-user-drag: none;
    }
</style>