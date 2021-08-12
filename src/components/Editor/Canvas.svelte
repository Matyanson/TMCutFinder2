<div class="box"><!--to keep size relative to this, not the outside wrap-->
    <div class="wrap">
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
<script lang="ts">
import { onDestroy, onMount } from "svelte";

    let svg: SVGElement;
    let aspect_ratio = 16/9;
    let unit = 1080 / 100 //1% of VH

    let observer: ResizeObserver = null;


    onMount(() => {
        setup();
    })
    onDestroy(() => {
        if(observer)
            observer.disconnect();
    })

    const setup = () => {
        if(svg){
            const height = svg.getBoundingClientRect().height;
            const width = svg.getBoundingClientRect().width;
            aspect_ratio =  width / height;
            unit = height / 100;

            observer = new ResizeObserver(handleResize);
            observer.observe(svg);
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
        height: 100%;
        width: 100%;
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
    img {
        display: block;
        height: 100%;
        width: 100%;
        object-fit: contain;
    }
</style>