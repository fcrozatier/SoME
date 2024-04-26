import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { browserslistToTargets } from 'lightningcss';
import browserslist from 'browserslist';

export default defineConfig({
	plugins: [sveltekit()],
	css: {
		transformer: 'lightningcss',
		lightningcss: {
			targets: browserslistToTargets(browserslist('cover 95% and last 10 versions and not dead'))
		}
	},
	build: {
		cssMinify: 'lightningcss'
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
