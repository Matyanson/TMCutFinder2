<div class="container" bind:this={svg}>
    {#if routePoints.length > 0}
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline 
        vector-effect="non-scaling-stroke"
        points={pointsToPath(routePoints, aspect_ratio)}
        />
    </svg>
    <svg>
        <circle r={7} cx={`${car.x / aspect_ratio}%`} cy={`${car.y}%`} />
    </svg>
    {/if}
    <img alt="screenshot of map" src={$imgSrc}/>
</div>

<script lang="ts">
import type Coords from "src/models/Coords";
import type { PathNode } from "src/models/Node";
import type { Route } from "src/models/Route";
import { imgSrc, paths } from "src/store";
import { sizeTracker } from "src/utils/dom";
import { addPoints, getDist, pointsToDist, pointsToPath } from "src/utils/functions";
import { onMount } from "svelte";

export let route: Route;
export let percentage = 0;
let routePoints: Coords[];
$: routePoints = mergePoints(route.points.slice(1)) ?? [];
$: car = routePoints.length > 0 ?
getPercentagePoint(percentage / 100, routePoints) :
{x:0,y:0};

$: console.log(percentage);

let svg: Element;
let aspect_ratio = 16/9;

const observer = sizeTracker();


const setup = () => {
    if(svg)
        observer.init(svg, handleResize);
}

const handleResize = () => {
    const svgRect = svg.getBoundingClientRect();
    aspect_ratio =  svgRect.width / svgRect.height;
}

onMount(setup);

const mergePoints = (pathNodes: PathNode[]) => {
    const pathPoints = pathNodes
    .map(p => {
        return p.start ? 
        $paths[p.index].points.reverse() : 
        $paths[p.index].points;
    })
    return pathPoints.flat();
}

const getPercentagePoint = (percentage: number, coords: Coords[]): Coords => {
    const totalDist = pointsToDist(coords);
    const chosenDistance = totalDist * percentage / 100;

    let dist = 0;
    let secondIndex = 1;     //between this and first index is the desired point

    while(dist < chosenDistance && secondIndex < coords.length - 1){
        const point1 = coords[secondIndex - 1];
        const point2 = coords[secondIndex];

        dist += getDist(point1, point2);
        secondIndex++;
    }
    const point1 = coords[secondIndex - 1];
    const point2 = coords[secondIndex];
    const percentageBetween = (dist - chosenDistance) / getDist(point1, point2);
    //point between ... x = (b - a) * fraction
    const margin = addPoints(point2, {x: -point1.x, y: -point1.y});
    const marginFraction = {x: margin.x * percentageBetween, y: margin.y * percentageBetween};
    return addPoints(point1, marginFraction);
}
</script>

<style>
    .container {
        position: relative;
        height: 100%;
        -webkit-user-drag: none;
        user-select: none;
        pointer-events: none;
    }
    img{
        display: block;
        height: 100%;
    }
    svg{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%; 
        height: 100%;
        overflow: visible;
        z-index: 1;
    }
    polyline{
        fill: none;
        stroke-width: 7;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke: #ececec75;
    }
    svg circle {
        stroke-width: 3px;
        fill: #ffff00;
    }
</style>