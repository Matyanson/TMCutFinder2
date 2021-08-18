import { get, writable, Writable } from "svelte/store";
import type Coords from "./models/Coords";
import type { Path } from "./models/Path";
import { wStorage } from "./utils/writableStores";


export const toolIndex = writable(0);

export const paths = createPaths();

function createPaths() {
    const { set, update, subscribe} = wStorage<Path[]>('paths', []);

    let selected = -1

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
            //prevent from storing empty paths
            if(get(paths)[selected] == newPath) return selected;
            selected = this.add(newPath);
            return selected;
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