import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			prerender: {
				handleHttpError: ({ status, path, referrer, referenceType }) => {
					throw new Error(`${status} ${path} (${referenceType} from ${referrer ?? 'entries'})`);
				},
				handleMissingId: ({ path, id, referrers }) => {
					throw new Error(
						`${path}#${id} has no element with that id (linked from ${referrers.join(', ')})`
					);
				},
				handleUnseenRoutes: ({ routes }) => {
					throw new Error(`routes never prerendered:\n${routes.join('\n')}`);
				}
			}
		})
	],
	server: { port: 5317, strictPort: true },
	preview: { port: 5318, strictPort: true },
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}', 'db/**/*.{test,spec}.ts'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
