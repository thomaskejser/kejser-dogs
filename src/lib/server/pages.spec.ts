import { describe, expect, it } from 'vitest';
import { allPages, findPage, parsePage } from './pages';

const valid = `---
title: Sources
description: Where the answers come from.
---

See [the journal](https://example.org).
`;

describe('parsePage', () => {
	it('parses front matter and renders the body to HTML', () => {
		const page = parsePage('sources', valid);
		expect(page).toMatchObject({
			slug: 'sources',
			title: 'Sources',
			description: 'Where the answers come from.'
		});
		expect(page.html).toContain('<a href="https://example.org">the journal</a>');
	});

	it('rejects a missing description', () => {
		const source = valid.replace('description: Where the answers come from.\n', '');
		expect(() => parsePage('sources', source)).toThrow(/Page "sources": .*"description"/);
	});

	it('rejects FAQ fields on a page', () => {
		const source = valid.replace('title: Sources', 'title: Sources\ncategory: Health');
		expect(() => parsePage('sources', source)).toThrow(/unknown front matter field\(s\): category/);
	});
});

describe('content', () => {
	it('serves the sources page', () => {
		expect(findPage('sources')?.title).toBe('Sources');
		expect(findPage('no-such-page')).toBeUndefined();
		expect(allPages().length).toBeGreaterThan(0);
	});
});
