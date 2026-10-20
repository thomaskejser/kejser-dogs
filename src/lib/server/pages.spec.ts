import { describe, expect, it } from 'vitest';
import { allPages, findPage, parsePage } from './pages';

const valid = `---
description: Where the answers come from.
---

# Sources

See [the journal](https://example.org).
`;

describe('parsePage', () => {
	it('takes the title from the # heading and renders the rest to HTML', async () => {
		const page = await parsePage('sources', valid);
		expect(page).toMatchObject({
			slug: 'sources',
			title: 'Sources',
			description: 'Where the answers come from.'
		});
		expect(page.html).toContain('<a href="https://example.org">the journal</a>');
		expect(page.html).not.toContain('<h1');
	});

	it('rejects a missing description', async () => {
		const source = valid.replace('description: Where the answers come from.\n', '');
		await expect(parsePage('sources', source)).rejects.toThrow(/Page "sources": .*"description"/);
	});

	it('rejects a title in front matter', async () => {
		const source = valid.replace('description:', 'title: Sources\ndescription:');
		await expect(parsePage('sources', source)).rejects.toThrow(
			/unknown front matter field\(s\): title/
		);
	});

	it('rejects a page without a # heading', async () => {
		await expect(parsePage('sources', valid.replace('# Sources\n', ''))).rejects.toThrow(
			/has 0 # headings/
		);
	});
});

describe('content', () => {
	it('serves the sources page', () => {
		expect(findPage('sources')?.title).toBe('Sources');
		expect(findPage('no-such-page')).toBeUndefined();
		expect(allPages().length).toBeGreaterThan(0);
	});
});
