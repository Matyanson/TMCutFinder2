// https://www.sitepoint.com/a-beginners-guide-to-sveltekit/
// https://prismic.io/blog/svelte-sveltekit-tutorial
// https://github.com/sveltejs/kit/issues/754

import preprocess from 'svelte-preprocess';
import vercel from '@sveltejs/adapter-vercel';
import { resolve } from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		adapter: vercel({
			fallback: 'index.html'
		}),
		ssr: true,
		hydrate: true,
		prerender: {
			crawl: true,
			enabled: true,
		},
		vite: {
			resolve: {
				alias: {
					src: resolve('./src')
				}
			}
		}
		
	}
};

export default config;
