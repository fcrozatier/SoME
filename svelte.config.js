import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsvex } from "mdsvex";
import rehypeTargetBlank from "rehype-target-plugin";

/**
 * @type {import('mdsvex').MdsvexOptions}
 */
const mdsvexOptions = {
	extensions: [".md"],
	rehypePlugins: [rehypeTargetBlank],
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: [".svelte", ".md"],
	preprocess: [mdsvex(mdsvexOptions), vitePreprocess()],

	kit: {
		adapter: adapter(),
	},
};

export default config;
