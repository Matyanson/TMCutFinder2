import { get, writable, Writable } from "svelte/store";
import type Coords from "./models/Coords";
import type { Path } from "./models/Path";
import { wStorage } from "./utils/writableStores";


export const toolIndex = writable(0);

export const paths = createPaths();

export const selectedPath = paths.selected;



function createPaths() {
    const selected = writable(-1);
    const {subscribe, set, update} = wStorage<Path[]>('paths', []);

    return {
        subscribe,
        selected,
        add: function (newPath: Path = {points: []}): number {
            update(old => {
                const n = [...old, newPath];
                return n;
            })
            return get(paths).length -1;
        },
        addNew: function (newPath: Path = {points: []}) {
            const objEqual = (a, b) => Object.entries(a).sort()+'' == Object.entries(b).sort()+'';
            //prevent from storing empty paths
            const curPath = get(paths)[get(selected)];
            if(curPath && objEqual(curPath, newPath)) return get(selected);
            const newIndex = this.add(newPath);
            selected.set(newIndex);
            return newIndex;
        },
        addPoints: function (index: number, points: Coords | Coords[]) {
            update(old => {
                old[index].points = [...old[index].points, ...[].concat(points)];
                return old;
            })
        },
        reset: () => set([])
    }
}