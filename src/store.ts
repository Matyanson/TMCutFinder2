import { writable, Writable } from "svelte/store";

interface IProfile  {
    username: string,
    imgSrc: string
}


const wStorage = <T>(key: string, initValue: T): Writable<T> => {
	const store = writable(initValue);
	if (typeof Storage === 'undefined') return store;

	const storedValueStr = localStorage.getItem(key);
	if (storedValueStr != null) store.set(JSON.parse(storedValueStr));

	store.subscribe((val) => {
		localStorage.setItem(key, JSON.stringify(val));
	})
	return store;
}


export const profileData = wStorage<IProfile | null>('profileData', null);