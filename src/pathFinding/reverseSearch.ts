import type { GenerateSettings } from "src/models/GenerateSettings";
import type { PathNode } from "src/models/Node";
import type { Route } from "src/models/Route";
import type { calcNode, calcPath } from "src/web-worker";

export default (start: PathNode, finishes: PathNode[], paths: calcPath[], nodes: calcNode[], settings: GenerateSettings, onUpdate: ()=>void = ()=>{}): Route[] => {

    const rootRoutes = getRouteTo(start, finishes);
    let root = rootRoutes.sort((a, b) => a.dist - b.dist)[0];
    const finalRoutes: Route[] = [];

    const all = nodes.filter(n => n.cpNum > -1);
    const cps = nodes.filter(n => n.type == 'cp');
    const rings = nodes.filter(n => n.type == 'ring');
    const usedCps: number[] = []
    
    for(let cp of cps){
        console.log(cp.cpNum);
        const cpRoutes = getRouteTo(cp.paths[0], root.points, true);
        if(cpRoutes?.length > 0 && cpRoutes[0].points?.length > 0) {
            const connected: Route[] = [];
            for(let branch of cpRoutes){
                const branchOutwards = reverseRoute(branch);
                const connectedRoute = joinBranch(root, branchOutwards, usedCps);
                connected.push(connectedRoute);
            }
            const shortest = connected.sort((a, b) => a.dist - b.dist)[0];
            root = shortest;
        }
        usedCps.push(cp.cpNum);
    }
    // for(let cp of rings){
    //     console.log(cp.cpNum);
    //     const cpRoutes = getRouteTo(cp.paths[0], root.points, true);
    //     if(cpRoutes?.length > 0 && cpRoutes[0].points?.length > 0) {
    //         const connected: Route[] = [];
    //         for(let branch of cpRoutes){
    //             const branchOutwards = reverseRoute(branch);
    //             const connectedRoute = joinBranch(root, branchOutwards, usedCps);
    //             connected.push(connectedRoute);
    //         }
    //         const shortest = connected.sort((a, b) => a.dist - b.dist)[0];
    //         root = shortest;
    //     }
    //     usedCps.push(cp.cpNum);
    // }

    // let cp = all[28];
    // const cpRoutes = getRouteTo(cp.paths[0], root.points, true);
    // const branch = cpRoutes.sort((a, b) => a.dist - b.dist)[0];
    // if(branch?.points?.length > 0){
    //     const branchOutwards = reverseRoute(branch);
    //     root = joinBranch(root, branchOutwards);
    // }

    return [root ?? {cps:[], points:[], dist:0}];

    function getRouteTo(from: PathNode, to: PathNode[], reverse: boolean = false): Route[] {
        const destination = to.map(x => getAllPointsFrom(x)).flat();
        const completeRoutes: Route[] = [];
        const usedPoints: PathNode[][] = [];

        searchNextPoint({points: [from], dist:0, cps:[]});
        return completeRoutes.sort((a, b) => a.dist - b.dist);

        function searchNextPoint(route: Route, depth: number = 0) {
            const curPoint = route.points[route.points.length - 1];
            const curPath = paths[curPoint.index];
            const curNode = curPoint.start ? curPath.start : curPath.end;
            if(!curNode) return;

            route.dist += curPath.dist;
            if(destination.some(t => t.index == curPoint.index && t.start == curPoint.start)){
                completeRoutes.push({...route, points: route.points.slice(1)});
                return;
            }
            usedPoints[depth] = usedPoints[depth] ? usedPoints[depth].concat(curNode.paths) : curNode.paths;

            const nextPoints = curNode.paths
            .map(p => {
                return {...p, start: !p.start};
            })
            const wrongWay = (p: PathNode) => paths[p.index]?.type == 'oneway' && p.start == !reverse;
            const hasBeenVisited = (p: PathNode) => usedPoints.slice(0, depth + 1).flat().some(u => u.index == p.index && u.start == p.start);
            for(let p of nextPoints){
                if(!hasBeenVisited(p) && !wrongWay(p)){
                    searchNextPoint({...route, points: [...route.points, p]}, depth + 1);
                }
            }
        }
    }
    function joinBranch(root: Route, branch: Route, usedCps: number[] = undefined){
        if(branch?.points?.length < 1) return {dist:0,points:[],cps:[]};

        const intersectPoint = { ...branch.points[0], start: !branch.points[0].start};
        const [segment1, segment2] = splitPoints(intersectPoint, root.points);  //fix, there could me more than 1 intersection!
        const usedCpsAhead = usedCps.filter(cp => !segment1.some(p => pointToNode(p).cpNum == cp));  //cps that aren't in segment1
        let nextCpIndex = findFirstTakenCPIndex(segment2, undefined, (cp) => !usedCpsAhead || usedCpsAhead.includes(cp.num));
        nextCpIndex = nextCpIndex > -1 ? nextCpIndex : segment2.length - 1;    //nextCp is the finish

        const leaf = branch.points[branch.points.length - 1];
        const path = paths[leaf.index];
        const leafNode = leaf.start ? path.start : path.end;

        const routesBack = getRouteTo(leaf, segment2.slice(0, nextCpIndex + 1));
        if(leafNode.type == 'ring'){
            const routeBeforeRing = [...segment1, ...branch.points];
            let lastCpIndex = findLastTakenCPIndex(routeBeforeRing, undefined, (cp) => cp.type == 'cp');
            lastCpIndex = lastCpIndex > -1 ? lastCpIndex : 0;    //lastCp is the start
            const routesFromLastCp = getRouteTo(routeBeforeRing[lastCpIndex], [segment2[nextCpIndex]]);
            routesBack.push(...routesFromLastCp);
        }
        if(routesBack.length < 1) return;
        const shortestRouteBack = routesBack.sort((a, b) => a.dist - b.dist)[0];
        const routePoints = [...segment1, ...branch.points, ...shortestRouteBack.points];
        if(shortestRouteBack.points.length > 0){
            const connectBackPoint = shortestRouteBack.points[shortestRouteBack.points.length - 1];
            const [x, segment3] = splitPoints(connectBackPoint, segment2);
            routePoints.push(...segment3);
        } else {
            routePoints.push(...segment2);
        }
        return pointsToRoute(routePoints);
    }
    function mergeRoutes(...routes: Route[]): Route {
        return {
            dist: routes.map(r => r.dist).reduce((total, cur) => total + cur),
            cps: [].concat(routes.map(r => r.cps).flat()),
            points: [].concat(routes.map(r => r.points).flat())
        };
    }
    function pointToNode(point: PathNode) {
        const path = paths[point.index];
        const node = point.start ? path.start : path.end;
        return node;
    }
    function getAllPointsFrom(point: PathNode) {
        return pointToNode(point).paths;
    }
    function isSameNode(p1: PathNode, p2: PathNode){
        const n1 = pointToNode(p1);
        const n2 = pointToNode(p2);
        return n1.coords.x == n2.coords.x && n1.coords.y == n2.coords.y;
    }
    function splitPoints(intersect: PathNode, points: PathNode[]) {
              //reversed (find lastest intersection), can undo
        const intersectIndex = points.findIndex(p => isSameNode(p, intersect));
        const firstSegment = points.slice(0, intersectIndex + 1)
        const secondSegment = points.slice(intersectIndex + 1)
        return [firstSegment, secondSegment];
    }
    function findLastTakenCPIndex(points: PathNode[], takenCps: Route['cps'] = [], filter = (cp: Route['cps'][0]) => cp.num > -1) {
        const nodes = points.map(p => pointToNode(p));
        takenCps =  takenCps ?? pointsToTakenCps(points);

        const lastCPNum = takenCps.slice().reverse().find(filter)?.num;     //find num of the last taken CP
        if(lastCPNum == undefined) return -1;

        return nodes.findIndex(n => n.cpNum == lastCPNum);
    }
    function findFirstTakenCPIndex(points: PathNode[], takenCps: Route['cps'] = undefined, filter = (cp: Route['cps'][0]) => cp.num > -1) {
        const nodes = points.map(p => pointToNode(p));
        takenCps =  takenCps ?? pointsToTakenCps(points);
                
        const firstCPNum = takenCps.find(filter)?.num;     //find num of the first taken CP
        if(firstCPNum == undefined) return -1;

        return nodes.findIndex(n => n.cpNum == firstCPNum);
    }
    function pointsToTakenCps(points: PathNode[]){
        const takenCps = [];
        for(let n of points.map(p => pointToNode(p))){
            if(n.type == 'cp' || n.type == 'ring' && !takenCps.some(cp => cp.num == n.cpNum))
                takenCps.push({ num: n.cpNum, type: n.type });
        }
        return takenCps;
    }
    function pointsToRoute(points: PathNode[]) {
        const r: Route = {dist: 0, cps: [], points};
        for(let p of points){
            const path = paths[p.index];
            const node = p.start ? path.start : path.end;

            r.dist += path.dist;
            if((node.type == 'cp' || node.type == 'ring') && !r.cps.some(cp => cp.num == node.cpNum)){
                r.cps.push({ num: node.cpNum, type: node.type });
            }
        }
        return r;
    }
    function reversePoints(points: PathNode[]) {
        return points.slice().reverse()
        .map(p => {
            return {...p, start: !p.start};
        })
    }
    function reverseRoute(r: Route): Route {
        return {...r, points: reversePoints(r.points), cps: r.cps.reverse()};
    }
}
