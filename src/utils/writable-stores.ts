import { writable, Writable } from "svelte/store";
import {get, set} from "idb-keyval"

export const wStorage = <T>(key: string, initValue: T): Writable<T> => {
	const store = writable(initValue);
	if (typeof Storage === 'undefined') return store;

	const storedValueStr = localStorage.getItem(key);
	if (storedValueStr != null) store.set(JSON.parse(storedValueStr));

	store.subscribe((val) => {
		localStorage.setItem(key, JSON.stringify(val));
	})
	return store;
}

export const iStorage = <T>(key: string, initValue: T): Writable<T> => {
	const store = writable(initValue);
	if (typeof indexedDB === 'undefined') return store;

	(async ()=>{
		const storedValue = await get(key);
		store.set(storedValue);
	})();

	store.subscribe((val) => {
		set(key, val);
	})
	return store;
}