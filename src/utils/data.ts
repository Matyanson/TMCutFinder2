import type { Route } from "src/models/Route";

export const routeToStr = (r: Route) => {
    return r.points
    .map(p => `${p.index},${p.start ? 'S': 'E'};`)
    .reduce((total, cur) => total + cur);
}
export const strToRoute = (s: string) => {
    const res = { points: [], dist: 0, cps: []};
    const pointsStr = s.split(';');
    for(const p of pointsStr){
        const vals = p.split(',');
        res.points.push({
            index: Number(vals[0]),
            start: vals[1] == 'S' ? true : false
        })
    }
    return res;
}