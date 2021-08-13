<div class="box"><!--to keep size relative to this, not the outside wrap-->
    <div class="wrap" style={`--zoom: ${scale * 100}%; --offsetX: ${position.x}%; --offsetY: ${position.y}%`}>
        <svg bind:this={svg}>
            <marker id="arrow" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 3 L 0 6 z" fill="#ddd"/>
            </marker>
            <circle cx={'10%'} cy={'10%'} r={10} fill={'white'} />
            <circle cx={'50%'} cy={'50%'} r={10} fill={'white'} />
            <circle cx={'-10%'} cy={'10%'} r={10} fill={'black'} />
        </svg>
            <img alt="screenshot of map" src="https://i.imgur.com/31jOVzP.jpeg"/>
    </div>
</div>
<svelte:window on:keydown={onKeyDown} />
<script lang="ts">
import { sizeTracker } from "src/utils/dom";
import { onMount } from "svelte";

    let svg: SVGElement;
    let aspect_ratio = 16/9;
    let unit = 1080 / 100 //1% of VH
    let scale = 1;
    let position = {x: 0, y: 0};
    
    const observer = sizeTracker();

    onMount(() => {
        setup();
    })

    const onKeyDown = (e: KeyboardEvent) => {
        console.log(e.key);
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
                position = {x: 0, y: 100 * (1-scale) / (2*scale)};
                break;
        }
    }

    const setup = () => {
        if(svg){
            const height = svg.getBoundingClientRect().height;
            const width = svg.getBoundingClientRect().width;
            aspect_ratio =  width / height;
            unit = height / 100;

            observer.init(svg, handleResize);
        }
    }
    const handleResize = () => {
        unit = svg.clientHeight / 100;
    }
</script>
<style>
    .box{
        display: flex;
        flex-flow: column;
        justify-items: center;
        align-items: center;
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