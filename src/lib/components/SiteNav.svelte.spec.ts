import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SiteNav from './SiteNav.svelte';

const items = [
	{ label: 'Questions', href: './' },
	{ label: 'Sources', href: './sources' }
];

describe('SiteNav', () => {
	it('marks the relative link that resolves to the current URL', async () => {
		render(SiteNav, { items, current: new URL('https://dogs.example/sources') });

		await expect
			.element(page.getByRole('link', { name: 'Sources' }))
			.toHaveAttribute('aria-current', 'page');
		await expect
			.element(page.getByRole('link', { name: 'Questions' }))
			.not.toHaveAttribute('aria-current');
	});

	it('marks no link on a page outside the nav', async () => {
		render(SiteNav, { items, current: new URL('https://dogs.example/faq/x') });

		await expect
			.element(page.getByRole('link', { name: 'Questions' }))
			.not.toHaveAttribute('aria-current');
	});
});
