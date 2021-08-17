import type Coords from "src/models/Coords";

export const getDist = (pointA: Coords, pointB: Coords) => {
    return Math.sqrt(
        Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2)
    );
}

export const addPoints = (pointA: Coords, pointB: Coords) => {
    return {x: pointA.x + pointB.x, y: pointA.y + pointB.y}
}