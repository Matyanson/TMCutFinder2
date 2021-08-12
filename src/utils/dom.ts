import { onDestroy } from "svelte";

interface SizeTracker {
    init: (el: Element | Element[], callback?: () => void) => void;
    add: (el: Element | Element[]) => void;
}

export const sizeTracker = (): SizeTracker => {
    let elements: Element[] = [];
    let observer: ResizeObserver = null;

    const init = (el: Element | Element[], callback: () => void = null) => {
        if(typeof(ResizeObserver) == 'undefined' && typeof(Window) != 'undefined') {
            window.addEventListener('resize', callback);
            return;
        }
        observer = new ResizeObserver(callback);
        add(el);
    }
    const add = (el: Element | Element[]) => {
        elements = elements.concat(el);
        elements.forEach(x => observer?.observe(x));
    }

    onDestroy(() => observer?.disconnect());
    return { init, add };
}