import type { PathNode } from 'src/models/Node';
import type { Route } from 'src/models/Route';
import type SearchAlghorithm from 'src/models/SearchAlgorithm';
import { routeToStr } from 'src/utils/data';
import {
	factorial,
	getNthPermutation,
	random,
	randomShuffle,
	splitByIndexes,
	uniqBy
} from 'src/utils/functions';
import type { calcNode, calcPath } from 'src/web-worker';

type PointKey = `${string},${string}`;
const name = 'reverse search v3';

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
	const allCps = [...cps, ...rings];

	// get direct shortest routes to finishes
	const rootRoutes = getRouteTo(start, finishes);
	if (allCps.length < 1) return rootRoutes;

	let finalRoutes: Route[] = [];
	const usedRoutes: { [key: string]: boolean } = {};

	const order = randomShuffle(allCps.length);
	const orderCount = factorial(allCps.length);
	const orderLimit = Math.min(orderCount, 1000);
	const randomN = randomShuffle(orderLimit);

	for (let i = 0; i < randomN.length; i++) {
		let root = rootRoutes[0];
		const n = randomN[i];
		const orderPermutation = getNthPermutation(n, order);
		for (const j of orderPermutation) {
			const cp = allCps[j];
			root = addPointToRoute(root, cp.paths[0]);
		}
		addRoute(root);
		onProgress(100 * (i / orderLimit));
	}

	return finalRoutes;

	function getRouteTo(from: PathNode, to: PathNode[], reversed = false): Route[] {
		const destination = to
			.filter((x) => x)
			.map((x) => getAllPointsFrom(x))
			.flat();
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
				res.push(reversed ? reverseRoute(r) : r);
			}
		}

		return res.sort((a, b) => a.dist - b.dist);

		function search(route: Route, currPoint: PathNode) {
			// check if cp
			if (!currPoint) return;
			const node = pointToNode(currPoint);
			if (!node) return;
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
				if (r.points.length < 1) continue;
				const lastPoint = r.points[r.points.length - 1];
				search(r, lastPoint);
			}
		}
	}

	function addPointToRoute(root: Route, p: PathNode) {
		// check if is already part of route
		const isOnRoute = root.points.some((x) => isConnected(p, x));
		if (isOnRoute) return root;

		const routesLeft = getRouteTo(p, root.points, true);
		const routesRight = getRouteTo(p, root.points);

		// find intersections where middle contains no cps
		let middleContainsCPS = true;
		let [left, middle, right]: PathNode[][] = [[], [], []];
		let i = 0;
		while (middleContainsCPS) {
			const j = Math.floor(i / 2);
			const k = Math.floor((i + 1) / 2);
			// get intersections
			const intersectionLeft = routesLeft[j].points[0];
			const intersectionRight = routesRight[k].points[routesRight[k].points.length - 1];
			// get intersection indexes
			const leftIndex = root.points.findIndex((p) => isConnected(p, intersectionLeft));
			const rightIndex = root.points.findIndex((p) => isConnected(p, intersectionRight));
			// split root route into left|middle|right
			[left, middle, right] = splitByIndexes(root.points, leftIndex, rightIndex);
			if (left.length < 1) left = [root.points[0]];
			// check for cps
			const middleCpIndexes = cpIndexes(middle);
			if (middleCpIndexes.length < 1) middleContainsCPS = false;
			i++;
		}

		// trim until cp or (start|finish) is reached
		const leftCpIndexes = cpIndexes(left);
		const rightCpIndexes = cpIndexes(right);

		const leftTrimmedIndex = leftCpIndexes[leftCpIndexes.length - 1] ?? 0;
		const rightTrimmedIndex = rightCpIndexes[0] ?? right.length - 1;

		// get new routes to/from the point
		const routesLeftTrimmed = getRouteTo(p, [left[leftTrimmedIndex]], true);
		const routesRightTrimmed = getRouteTo(p, [right[rightTrimmedIndex]]);

		// connect to root
		const rootLeftPoints = left.slice(0, leftTrimmedIndex + 1);
		const rootRightPoints = right.slice(rightTrimmedIndex + 1);

		let finalPoints = [
			...rootLeftPoints,
			...routesLeftTrimmed[0].points,
			...routesRightTrimmed[0].points,
			...rootRightPoints
		];
		return routeFromPoints(finalPoints);
	}

	/* HELPER */
	function addRoute(r: Route) {
		const routeStr = routeToStr(r);
		if (!usedRoutes[routeStr]) {
			finalRoutes.push(r);
			finalRoutes = finalRoutes.slice(0, settings.limit + 1).sort((a, b) => a.dist - b.dist);
			onUpdate(finalRoutes);
			usedRoutes[routeStr] = true;
		}
	}

	function cpIndexes(points: PathNode[]) {
		const visited: Record<number, boolean> = {};
		const indexes: number[] = [];
		for (let i = 0; i < points.length; i++) {
			const node = pointToNode(points[i]);
			if (node && (node.type == 'cp' || node.type == 'ring')) {
				if (!visited[i]) indexes.push(i);
				visited[i] = true;
			}
		}
		return indexes;
	}

	function reversePoints(points: PathNode[]) {
		return points
			.slice()
			.reverse()
			.map((p) => {
				return { ...p, start: !p.start };
			});
	}

	function routeFromPoints(points: PathNode[]): Route {
		if (points.length < 1) return { points: [], cps: [], dist: 0 };
		// calcuate cps & dist
		const startPoint = { ...points[0], start: !points[0].start };
		const cps: Route['cps'] = [];
		let dist = -paths[startPoint.index].dist;
		for (const p of [startPoint, ...points]) {
			dist += paths[p.index].dist;
			const node = pointToNode(p);
			if (node && (node.type == 'cp' || node.type == 'ring')) {
				cps.push({
					num: node.cpNum,
					type: node.type
				});
			}
		}

		return {
			points: [...points],
			dist,
			cps: uniqBy(cps, (cp) => cp.num)
		};
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

	function isConnected(p1: PathNode, p2: PathNode) {
		const node = pointToNode(p1);
		if (!node) return false;
		return node.paths.some((p) => p.index == p2.index);
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
		const node = pointToNode(point);
		if (!node) return [];
		return node.paths;
	}
};

export default {
	name,
	func
};
