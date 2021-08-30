<div class="canvas" bind:this={svg}>
    <svg class="bottom" viewBox="0 0 100 100" preserveAspectRatio="none">
        <marker id="arrow" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="2.5" markerHeight="2.5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 3 L 0 6 z" fill="#ddd"/>
        </marker>
        {#each $paths as path, i}
            <polyline 
            class={`path ${path.type}`} class:selected={i == $selectedPath}  vector-effect="non-scaling-stroke"
            points={pointsToPath(path.points)} on:mouseenter={() => hoverPath = i} on:mouseleave={() => hoverPath = -1}
            />
        {/each}
    </svg>
    <svg class="top">
        {#each $nodes as node, i}
            <circle
            class={`node ${node.type}`} class:selected={i == $selectedNode} r={10}
            cx={`${node.coords.x / aspect_ratio}%`} cy={`${node.coords.y}%`} on:mouseenter={() => hoverNode = i} on:mouseleave={() => hoverNode = -1}
            />
        {/each}
        {#each cps as cp, i}
            <text class="transparent" x={`${cp.coords.x / aspect_ratio}%`} y={`${cp.coords.y}%`} text-anchor="middle" alignment-baseline="middle" stroke="#000">{i}</text>
        {/each}
        {#if hoverPath > -1}
        <circle class={`transparent ${$toolIndex == 2 ? $nodeType : ''}`} cx={`${fakeNode.x / aspect_ratio}%`} cy={`${fakeNode.y}%`} r={10} />
        {/if}
        <text x={'0%'} y={'100%'} fill={'white'}>{`${Math.floor(m.x)}:${Math.floor(m.y)}`}</text>
        <text x={'0%'} y={'95%'} fill={'white'}>{`${hoverPath} ${hoverNode}`}</text>
    </svg>
    <img alt="screenshot of map" src={img}/>
</div>
<svelte:window on:wheel={handleResize} on:keyup={handleKeyUp} />

<script lang="ts">
import type Coords from "src/models/Coords";
import type { INode } from "src/models/Node";
import { nodes, nodeType, paths, selectedNode, selectedPath, toolIndex } from "src/store";
import { sizeTracker } from "src/utils/dom";
import { getDist, nearestIndex } from "src/utils/functions";
import { getContext, onMount } from "svelte";

    const context: any = getContext('canvas');

    export let img: string = '';

    //svg
    let svg: Element;
    let outerDiv: Element;
    let aspect_ratio = 16/9;
    let unit = 1080 / 100; //1% of VH

    //mouse
    let m: Coords = {x: 0, y: 0};
    let m1Down = false;
    let m2Down = false;

    //canvas objects
    const minDist = 1;
    let hoverPath = -1;
    let hoverNode = -1;
    let lastPoint: Coords = {x: 0, y: 0};
    let fakeNode: Coords = {x: 0, y: 0};

    let cps: INode[];
    $: cps = $nodes.filter(n => n.type == 'cp' || n.type == 'ring');

    const observer = sizeTracker();

    onMount(() => {
        if(context && context.getBox){
            const box: Element = context.getBox();
            outerDiv = box;
        } else {
            outerDiv = svg;
        }
        if(svg){
            handleResize();

            observer.init(svg, handleResize);
        }
        outerDiv.addEventListener('mousemove', onMouseMove);
        outerDiv.addEventListener('mousedown', onMouseDown);
        outerDiv.addEventListener('mouseup', onMouseUp);
    })
    
    const onMouseDown = (e: MouseEvent) => {
        e.button === 0 ?
        m1Down = true :
        m2Down = true;

        switch($toolIndex){
            case 0:
                $selectedPath = hoverPath > -1 ? hoverPath : -1;
                $selectedNode = hoverNode > -1 ? hoverNode : -1;
                break;
            case 1:
                if(!$paths[$selectedPath]){
                    paths.addNew();
                }
                const starts = $paths[$selectedPath].points.length < 1;
                
                if(hoverNode > -1){
                    paths.addPoints($selectedPath, $nodes[hoverNode].coords);
                    nodes.addPaths(hoverNode, {index: $selectedPath, start: starts });
                    if(!starts) paths.addNew();
                } else if(hoverPath > -1) {
                    connectPaths(starts);
                    if(!starts) paths.addNew();
                }
                break;
            case 2:
                if(hoverPath > -1){
                    nodes.addNew(fakeNode, hoverPath);
                    paths.addNew();
                }
                break;
            case 3:
                break;
            
        }
    }
    const onMouseUp = (e: MouseEvent) => {
        e.button === 0 ?
        m1Down = false :
        m2Down = false;

        switch($toolIndex){
            case 0:
                break;
            case 1:
                break;
            case 2:
                break;
            case 3:
                break;
            
        }
    }
    const onMouseMove = (e: MouseEvent) => {
        saveMousePosition(e.clientX, e.clientY);
        calcFakeNode();

        switch($toolIndex){
            case 0:
                break;
            case 1:
                if(m1Down && getDist(lastPoint, m) > minDist){
                    if(!$paths[$selectedPath]){
                        $selectedPath = paths.add();
                    }
                    paths.addPoints($selectedPath, m);
                    lastPoint = {...m};
                }
                break;
            case 2:
                break;
            case 3:
                break;
            
        }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
        switch(e.key){
            case 'Delete':
                if($selectedPath > -1)
                    paths.delete($selectedPath);
                break;
        }
    }

    const handleResize = () => {
        const svgRect = svg.getBoundingClientRect();
        aspect_ratio =  svgRect.width / svgRect.height;
        unit = svg.clientHeight / 100;
    }

    const saveMousePosition = (mouseX: number, mouseY: number) => {
        const svgRect = svg.getBoundingClientRect();
        m = {
            x: (mouseX - svgRect.left) / unit,
            y: (mouseY - svgRect.top) / unit
        }
    }

    const calcFakeNode = () => {
        if($paths[hoverPath] && ($toolIndex == 1 || $toolIndex == 2)) {
            const currPath = $paths[hoverPath];
            const nearestPointIndex = nearestIndex(m, currPath.points);
            if(hoverPath == $selectedPath && currPath.points.length - nearestPointIndex < 5) return;
            fakeNode = currPath.points[nearestPointIndex] ?? {x: 0, y: 0};
        }
    }

    const pointsToPath = (points: Coords[]) => {
        let path = "";
        let pointsCopy = [...points];
        for(let p of pointsCopy){
            path += ` ${p.x / aspect_ratio},${p.y}`;
        }
        return path;
    }

    const connectPaths = (starts: boolean) => {
        const nodeIndex = nodes.addNew(fakeNode, hoverPath, 'normal');
        const pathIndex = starts ? paths.addNew() : $selectedPath;

        paths.addPoints(pathIndex, fakeNode);
        nodes.addPaths(nodeIndex, {index: pathIndex, start: starts });
    }
</script>

<style>
    .canvas{
        position: relative;
        height: 100%;
        background-color: #fff;
    }
    svg {
        user-select: none;
        pointer-events: none;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%; 
        height: 100%;
        overflow: visible;
        z-index: 1;
    }
    svg * {
        pointer-events: auto;
    }
    img{
        display: block;
        height: 100%;
        user-select: none;
        -webkit-user-drag: none;
        filter: opacity(0.85);
    }
    svg polyline {
        fill: none;
        stroke-width: 10px;
        stroke: #1b36ca;
        stroke-linecap: round;
        stroke-linejoin: round;
        transition: 0.2s;
    }
    svg polyline.oneway {
        stroke-width: 5px;
        stroke: #000;
        marker-end: url(#arrow);
    }
    svg circle {
        stroke-width: 3px;
        fill: #fff;
        transition: stroke-width fill stroke 0.2s;
    }
    svg circle.cp {
        fill: #ffff00;
    }
    svg circle.ring {
        fill: #ffffffab;
        stroke: #ffff00;
        stroke-width: 6px;
    }
    svg polyline:hover, circle:hover {
        stroke: #14258a!important;
    }
    svg polyline.selected, circle.selected{
        stroke: #6c82ff!important;
    }
    .transparent{
        opacity: 0.7;
        pointer-events: none;
        user-select: none;
    }
</style>