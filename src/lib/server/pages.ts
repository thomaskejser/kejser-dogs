import { parseMarkdown, slugFromPath } from './markdown.ts';

export type Page = {
	slug: string;
	title: string;
	description: string;
	html: string;
};

const sources = import.meta.glob<string>('/content/pages/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
});

export function parsePage(slug: string, source: string): Page {
	const { fields, html } = parseMarkdown('Page', slug, source, ['title', 'description'] as const);
	return { slug, ...fields, html };
}

const pages: Page[] = Object.entries(sources).map(([path, source]) =>
	parsePage(slugFromPath(path), source)
);

export function allPages(): Page[] {
	return pages;
}

export function findPage(slug: string): Page | undefined {
	return pages.find((page) => page.slug === slug);
}
