<div class="container" bind:this={svg}>
    {#if routePoints.length > 0}
    {#each routePoints as points}
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline class:loading
        vector-effect="non-scaling-stroke"
        points={pointsToPath(points, aspect_ratio)}
        />
    </svg>
    <svg>
        <circle r={7} cx={`${car.x / aspect_ratio}%`} cy={`${car.y}%`} />
    </svg>
    {/each}
    {/if}
    <img alt="screenshot of map" src={$imgSrc}/>
</div>

<script lang="ts">
import type Coords from "src/models/Coords";
import type { PathNode } from "src/models/Node";
import type { Route } from "src/models/Route";
import { imgSrc, paths } from "src/store";
import { sizeTracker } from "src/utils/dom";
import { getDist, lerpPoint, pointsToDist, pointsToPath } from "src/utils/functions";
import { onMount } from "svelte";

export let route: Route;
export let loading: boolean;
export let percentage = 0;
let routePoints: Coords[][];
$: routePoints = mergePoints(route.points) ?? [];
$: car = routePoints.length > 0 ?
getPercentagePoint2d(percentage, routePoints) :
{x:0,y:0};

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

const mergePoints = (pathNodes: PathNode[]): Coords[][] => {
    const pathPoints = pathNodes
    .map(p => {
        return p.start ? 
        $paths[p.index].points.slice().reverse() :  //dooooont fricking mutate!!!!
        $paths[p.index].points;
    })
    return pathPoints;
}
const getPercentagePoint2d = (percentage: number, points: Coords[][]): Coords =>{
    const totalDist = points.map(p => pointsToDist(p)).reduce((total, cur) => total + cur);
    const chosenDistance = totalDist * percentage / 100;

    let dist = 0;
    for(let i in points){
        dist += pointsToDist(points[i]);
        if(dist > chosenDistance){
            const curDist = pointsToDist(points[i]);
            const fraction = (dist - chosenDistance) / curDist;
            return getPercentagePoint((1 - fraction) * 100, points[i]);
        }
    }
    return points[points.length - 1][points[points.length - 1].length - 1];
}
const getPercentagePoint = (percentage: number, coords: Coords[]): Coords => {
    const totalDist = pointsToDist(coords);
    const chosenDistance = totalDist * percentage / 100;

    let dist = 0;
    let firstIndex = 0;     //between this and second index is the desired point

    for (let i = 0; i < coords.length - 1; i++) {
        firstIndex = i;
        dist += getDist(coords[firstIndex], coords[firstIndex + 1]);
        if(dist > chosenDistance) break;
    }
    
    const p1 = coords[firstIndex];
    const p2 = coords[firstIndex + 1];
    const fractionBetween = getDist(p1, p2) !== 0 ? (dist - chosenDistance) / getDist(p1, p2) : 1;
        
    //point between ... p1 & p2
    return lerpPoint(p1, p2, 1 - fractionBetween);
}
</script>

<style>
    .container {
        position: relative;
        height: 100%;
        background: #fff;
        -webkit-user-drag: none;
        user-select: none;
        pointer-events: none;
    }
    img{
        display: block;
        height: 100%;
        opacity: 0.85;
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
    polyline.loading{
        stroke: #d4101075;
    }
    svg circle {
        stroke-width: 3px;
        fill: #ffff00;
    }
</style>