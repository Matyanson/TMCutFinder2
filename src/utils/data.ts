import type { Route } from "src/models/Route";

export const routeToStr = (r: Route) => {
    return r.points
    .map(p => `${p.index},${p.start ? 'S': 'E'};`)
    .reduce((total, cur) => total + cur);
}