<svg>
    <marker id="arrow" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 3 L 0 6 z" fill="#ddd"/>
    </marker>
    <text x={'0%'} y={'100%'} fill={'white'}>{`${Math.floor(m.x)}:${Math.floor(m.y)}`}</text>
    <circle cx={'10%'} cy={'10%'} r={10} fill={'white'} />
    <circle cx={'50%'} cy={'50%'} r={10} fill={'white'} />
    <circle cx={'-10%'} cy={'10%'} r={10} fill={'black'} />           
</svg>
<svelte:window on:mousedown={onMouseDown} on:mouseup={onMouseUp} />

<script lang="ts">
import type Coords from "src/models/Coords";

    export let m: Coords;
    export let unit: number;
    
    $: {
        onMouseMove(m);
    }

    const onMouseDown = (e: MouseEvent) => {
        console.log('down')
    }
    const onMouseUp = (e: MouseEvent) => {
        console.log('up')
    }
    const onMouseMove = (m: Coords) => {
        //console.log('move')
    }
</script>

<style>
    svg{
        user-select: none;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%; 
        height: 100%;
        overflow: visible;
    }
</style>