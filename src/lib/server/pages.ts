import { renderMarkdown } from './markdown.ts';
import { checkFrontMatter, requireText, slugFromPath } from './collection.ts';

export type Page = {
	slug: string;
	title: string;
	description: string;
	html: string;
};

const sources = import.meta.glob<string>('/src/content/pages/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
});

export async function parsePage(slug: string, source: string): Promise<Page> {
	const { frontMatter, title, html } = await renderMarkdown(`pages/${slug}`, source, {
		stripTitle: true
	});
	const where = `Page "${slug}"`;
	checkFrontMatter(frontMatter, ['description'], where);
	return { slug, title, description: requireText(frontMatter, 'description', where), html };
}

const pages: Page[] = await Promise.all(
	Object.entries(sources).map(([path, source]) => parsePage(slugFromPath(path), source))
);

export function allPages(): Page[] {
	return pages;
}

export function findPage(slug: string): Page | undefined {
	return pages.find((page) => page.slug === slug);
}
