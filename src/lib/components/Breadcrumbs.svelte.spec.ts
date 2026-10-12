import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Breadcrumbs from './Breadcrumbs.svelte';

describe('Breadcrumbs', () => {
	it('links crumbs with an href and marks only the last crumb as the current page', async () => {
		render(Breadcrumbs, {
			crumbs: [{ label: 'Home', href: '/' }, { label: 'Health' }, { label: 'Chocolate' }]
		});

		await expect.element(page.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
		await expect.element(page.getByText('Health')).not.toHaveAttribute('aria-current');
		await expect.element(page.getByText('Chocolate')).toHaveAttribute('aria-current', 'page');
		expect(page.getByRole('link').elements()).toHaveLength(1);
	});
});
