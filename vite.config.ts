import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	optimizeDeps: {
		// mapbox is a dependency of bcrypt. As of 05/2024 generates errors in dev mode: No loader is configured for ".html"
		exclude: ['@mapbox']
	}
});
