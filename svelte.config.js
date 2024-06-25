import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import targetBlank from 'svelte-target-blank';

/**
 * @type {import('mdsvex').MdsvexOptions}
 */
const mdsvexOptions = {
	extensions: ['.md'],
	layout: './src/lib/components/LayoutProse.svelte',
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx', '.md'],
	preprocess: [
		vitePreprocess(),
		mdsvex(mdsvexOptions),
		targetBlank({ mode: 'warn', silentList: '/**/*.md' }),
	],

	kit: {
		adapter: adapter(),
	},
};

export default config;
