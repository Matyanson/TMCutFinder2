import type Coords from 'src/models/Coords';

export const getDist = (pointA: Coords, pointB: Coords) => {
	return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
};

export const pointsToDist = (points: Coords[]) => {
	let dist: number = 0;
	for (let i = 1; i < points.length; i++) {
		const p = points[i];
		const prevP = points[i - 1];
		dist += getDist(prevP, p);
	}
	return dist;
};

export const addPoints = (pointA: Coords, pointB: Coords) => {
	return { x: pointA.x + pointB.x, y: pointA.y + pointB.y };
};

export const lerp = (v0: number, v1: number, t: number) => {
	return (1 - t) * v0 + t * v1;
};

export const lerpPoint = (p1: Coords, p2: Coords, t: number) => {
	return {
		x: lerp(p1.x, p2.x, t),
		y: lerp(p1.y, p2.y, t)
	};
};

export const nearestIndex = (pointA: Coords, points: Coords[]) => {
	if (!points[0]) return -1;
	let res = 0;
	let shortestDist = getDist(pointA, points[0]);

	for (let i = 1; i < points.length; i++) {
		const newDist = getDist(pointA, points[i]);
		if (newDist < shortestDist) {
			shortestDist = newDist;
			res = i;
		}
	}
	return res;
};

export const pointsToPath = (points: Coords[], ratio: number) => {
	let path = '';
	let pointsCopy = [...points];
	for (let p of pointsCopy) {
		path += ` ${p.x / ratio},${p.y}`;
	}
	return path;
};

export const median = (numbers: number[]) => {
	const sorted = numbers.slice().sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);

	if (sorted.length % 2 === 0) return (sorted[middle - 1] + sorted[middle]) / 2;

	return sorted[middle];
};

export const random = (from: number, to: number): number => {
	return Math.floor(Math.random() * to) + from;
};

export function uniqBy<T>(a: T[], key: (i: T) => number | string) {
	let seen = {};
	return a.filter(function (item) {
		let k = key(item);
		return seen.hasOwnProperty(k) ? false : (seen[k] = true);
	});
}

export function splitByIndexes<T>(arr: T[], ...indexes: number[]) {
	const chunks: T[][] = [];
	let previous = 0;
	for (const i of indexes) {
		chunks.push(arr.slice(previous, i));
		previous = i;
	}
	chunks.push(arr.slice(previous));
	return chunks;
}

export function randomShuffle(length: number) {
	const res: number[] = [];
	for (let i = 0; i < length; i++) {
		let n;
		do {
			n = random(0, length);
		} while (res.includes(n));
		res.push(n);
	}
	return res;
}

export function getNthPermutation(n, array) {
	const length = array.length;
	const indices = [];

	// Copy the array to avoid mutation
	const arrayCopy = array.slice();

	// Calculate the permutation indices
	for (let i = length - 1; i >= 0; i--) {
		const f = factorial(i);
		indices.push(Math.floor(n / f));
		n %= f;
	}

	// Map the indices to elements from the array
	return indices.map((i) => arrayCopy.splice(i, 1)[0]);
}

export function factorial(n) {
	if (n === 0 || n === 1) return 1;
	return n * factorial(n - 1);
}
