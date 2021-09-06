import type Coords from "src/models/Coords";

export const getDist = (pointA: Coords, pointB: Coords) => {
    return Math.sqrt(
        Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2)
    );
}

export const pointsToDist = (points: Coords[]) => {
    let dist: number = 0;
    for (let i = 1; i < points.length; i++) {
        const p = points[i];
        const prevP = points[i - 1];
        dist += getDist(prevP, p);
    }
    return dist;
}

export const addPoints = (pointA: Coords, pointB: Coords) => {
    return {x: pointA.x + pointB.x, y: pointA.y + pointB.y}
}

export const lerp = (v0: number, v1: number, t: number) => {
    return (1 - t) * v0 + t * v1;
}

export const lerpPoint = (p1: Coords, p2: Coords, t: number) => {
    return {
        x: lerp(p1.x, p2.x, t),
        y: lerp(p1.y, p2.y, t)
    };
}

export const nearestIndex = (pointA: Coords, points: Coords[]) => {
    if(!points[0]) return -1;
    let res = 0;
    let shortestDist = getDist(pointA, points[0]);

    for (let i = 1; i < points.length; i++) {
        const newDist = getDist(pointA, points[i]);
        if(newDist < shortestDist) {
            shortestDist = newDist;
            res = i;
        }
    }
    return res;
}

export const pointsToPath = (points: Coords[], ratio: number) => {
    let path = "";
    let pointsCopy = [...points];
    for(let p of pointsCopy){
        path += ` ${p.x / ratio},${p.y}`;
    }
    return path;
}