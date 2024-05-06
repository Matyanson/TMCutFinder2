import type { PathNode } from 'src/models/Node';
import type { Route } from 'src/models/Route';
import type SearchAlghorithm from 'src/models/SearchAlgorithm';
import { routeToStr } from 'src/utils/data';
import { random, uniqBy } from 'src/utils/functions';
import type { calcNode, calcPath } from 'src/web-worker';

type PointKey = `${string},${string}`;
const name = 'converging ends search';

let func: SearchAlghorithm;
func = (
	start,
	finishes,
	paths,
	nodes,
	settings,
	onUpdate: (r: Route[]) => void = () => {},
	onProgress: (percentage: number) => void = () => {}
): Route[] => {
	const cps = nodes.filter((n) => n.type == 'cp');
	const rings = nodes.filter((n) => n.type == 'ring');
	const cpCount = cps.length + rings.length;

	// get direct shortest routes to finishes
	const rootRoutes = getRouteTo(start, finishes);

	if (cpCount < 1) return rootRoutes;

	const finalRoutes = [];

	let fullLeftRoute: Route = { points: [], cps: [], dist: 0 };
	let fullRightRoute: Route = { points: [], cps: [], dist: 0 };
	let remainingCps = cps.map((node) => node.paths[0]);
	let leftPoint = start;
	let rightPoint = finishes[0];
	const visitedCps: Set<number> = new Set();
	const updateVisitedCps = (newCps: number[]) => newCps.forEach((x) => visitedCps.add(x));

	// add cps from left and right side (left = start, right = finish)
	while (visitedCps.size < cps.length) {
		// get closest checkpoints
		const leftRoutes = getRouteTo(leftPoint, remainingCps);
		const rightRoutes = getRouteTo(rightPoint, remainingCps, true);

		// get shortest route
		const leftRoute = leftRoutes[0];
		const rightRoute = reverseRoute(rightRoutes[0]);

		// update points
		leftPoint = leftRoute.points[leftRoute.points.length - 1];
		rightPoint = rightRoute.points[0];

		// update visited cps
		const sharedCps = [...leftRoute.cps, ...rightRoute.cps];
		const newCps = sharedCps.map((x) => x.num);
		updateVisitedCps(newCps);

		// remove cps from list
		remainingCps = remainingCps.filter(
			(p) => !sharedCps.some((cp) => cp.num == pointToNode(p).cpNum)
		);

		// connect checkpoints to each side
		fullLeftRoute = mergeRoutes(fullLeftRoute, leftRoute);
		fullRightRoute = mergeRoutes(rightRoute, fullRightRoute);

		finalRoutes.push(fullLeftRoute, fullRightRoute);
		console.log(...visitedCps);
		console.log(visitedCps.size, cps.length);
	}

	// merge left and right routes
	const middleRoute = getRouteTo(leftPoint, [rightPoint])[0];
	let finalRoute = mergeRoutes(fullLeftRoute, middleRoute);
	finalRoute = mergeRoutes(finalRoute, fullRightRoute);

	finalRoutes.push(finalRoute);
	return finalRoutes;

	function getRouteTo(from: PathNode, to: PathNode[], reversed = false): Route[] {
		const destination = to.map((x) => getAllPointsFrom(x)).flat();
		const visited: Record<PointKey, Route> = {};

		// set dist to source to 0
		const sourceRoute = { points: [], cps: [], dist: 0 };
		visited[getPointKey(from)] = sourceRoute;

		// recirsivelly search connected points
		search(sourceRoute, from);

		// get relevant routes
		const res: Route[] = [];
		const discoveredRoutes = Object.values(visited);
		for (const r of discoveredRoutes) {
			if (r.points.length < 1) continue;

			const lastPoint = r.points[r.points.length - 1];
			if (destination.some((t) => t.index == lastPoint.index && t.start == lastPoint.start)) {
				res.push(r);
			}
		}

		return res.sort((a, b) => a.dist - b.dist);

		function search(route: Route, currPoint: PathNode) {
			// check if cp
			const node = pointToNode(currPoint);
			if (node.type == 'cp' || node.type == 'ring') {
				route.cps.push({ num: node.cpNum, type: node.type });
			}
			// get all connected points
			const connectedPoints = node.paths;
			const nextPoints: PathNode[] = connectedPoints.map((x) => {
				return { ...x, start: !x.start };
			});

			const updatedRoutes: Route[] = [];
			const wrongWay = (p: PathNode) => paths[p.index].type == 'oneway' && p.start == !reversed;

			// add point to route
			for (const p of nextPoints) {
				if (wrongWay(p)) continue;

				const key = getPointKey(p);
				const dist = paths[p.index].dist;
				const newRoute = {
					points: [...route.points, p],
					dist: route.dist + dist,
					cps: [...route.cps]
				};
				// add if empty
				if (!visited.hasOwnProperty(key)) {
					visited[key] = newRoute;
					updatedRoutes.push(newRoute);
					continue;
				}

				const oldRoute = visited[key];
				// add if shorter
				if (newRoute.dist < oldRoute.dist) {
					visited[key] = newRoute;
					updatedRoutes.push(newRoute);
				}
			}

			// continue search from updated points
			for (const r of updatedRoutes) {
				const lastPoint = r.points[r.points.length - 1];
				search(r, lastPoint);
			}
		}
	}

	function connectCPToRoot(root: Route, cp: calcNode): Route {
		const cpRoutes = getRouteTo(cp.paths[0], root.points, true);
		return root;
	}

	/* HELPER */
	function reversePoints(points: PathNode[]) {
		return points
			.slice()
			.reverse()
			.map((p) => {
				return { ...p, start: !p.start };
			});
	}

	function reverseRoute(r: Route): Route {
		return { ...r, points: reversePoints(r.points), cps: r.cps.reverse() };
	}

	function mergeRoutes(r1: Route, r2: Route): Route {
		const mergedCps = uniqBy([...r1.cps, ...r2.cps], (cp) => cp.num);
		return {
			points: [...r1.points, ...r2.points],
			cps: mergedCps,
			dist: r1.dist + r2.dist
		};
	}

	function getPointKey(point: PathNode): PointKey {
		return `${point.index},${point.start}`;
	}

	function pointToNode(point: PathNode) {
		const path = paths[point.index];
		const node = point.start ? path.start : path.end;
		return node;
	}
	function getAllPointsFrom(point: PathNode) {
		return pointToNode(point).paths;
	}
};

export default {
	name,
	func
};
