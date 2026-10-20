import { categories, type Category, type Faq, type FaqCategory } from '#lib/faq.ts';
import { checkFrontMatter, requireText, slugFromPath } from './collection.ts';
import { renderMarkdown } from './markdown.ts';
import { parseReferences } from './references.ts';

export type FaqSource = Omit<Faq, 'category' | 'parent'> & {
	category: Category | undefined;
	parentSlug: string | undefined;
};

const sources = import.meta.glob<string>('/src/content/faq/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
});

const faqLinkPattern = /href="\/faq\/([^"#?/]+)/g;

function parseCategory(value: unknown, slug: string): Category {
	const category = categories.find((name) => name === value);
	if (!category) {
		throw new Error(`FAQ "${slug}": category "${value}" is not one of ${categories.join(', ')}`);
	}
	return category;
}

export async function parseFaq(slug: string, source: string): Promise<FaqSource> {
	const { frontMatter, title, html } = await renderMarkdown(`faq/${slug}`, source, {
		stripTitle: true
	});
	const where = `FAQ "${slug}"`;
	checkFrontMatter(frontMatter, ['summary', 'category', 'parent', 'references'], where);
	const summary = requireText(frontMatter, 'summary', where);
	const { category, parent } = frontMatter;
	if (category !== undefined && parent !== undefined) {
		throw new Error(`FAQ "${slug}": set either a category or a parent, not both`);
	}
	if (category === undefined && parent === undefined) {
		throw new Error(`FAQ "${slug}": needs a category, or a parent whose category it shares`);
	}
	if (parent !== undefined && (typeof parent !== 'string' || parent.trim() === '')) {
		throw new Error(`FAQ "${slug}": parent must be the slug of another question`);
	}
	return {
		slug,
		question: title,
		summary,
		category: category === undefined ? undefined : parseCategory(category, slug),
		parentSlug: typeof parent === 'string' ? parent.trim() : undefined,
		html,
		references: parseReferences(frontMatter.references, where)
	};
}

function categoryOf(source: FaqSource): Category {
	if (source.category === undefined) {
		throw new Error(`FAQ "${source.slug}": has no category`);
	}
	return source.category;
}

function linkedSlugs(html: string): string[] {
	return [...html.matchAll(faqLinkPattern)].map((match) => match[1]);
}

export function linkFaqs(sources: FaqSource[]): Faq[] {
	const bySlug = new Map(sources.map((source) => [source.slug, source]));
	const faqs = sources.map((source): Faq => {
		const { slug, question, summary, html, references, parentSlug } = source;
		const rest = { slug, question, summary, html, references };
		if (parentSlug === undefined) {
			return { ...rest, category: categoryOf(source), parent: undefined };
		}
		const parent = bySlug.get(parentSlug);
		if (!parent) {
			throw new Error(`FAQ "${rest.slug}": parent "${parentSlug}" does not exist`);
		}
		if (parent.parentSlug !== undefined) {
			throw new Error(`FAQ "${rest.slug}": parent "${parentSlug}" has a parent itself`);
		}
		return {
			...rest,
			category: categoryOf(parent),
			parent: { slug: parent.slug, question: parent.question }
		};
	});
	for (const faq of faqs) {
		const broken = linkedSlugs(faq.html).filter((slug) => !bySlug.has(slug));
		if (broken.length > 0) {
			throw new Error(`FAQ "${faq.slug}": links to missing question(s): ${broken.join(', ')}`);
		}
		if (faq.parent && !linkedSlugs(bySlug.get(faq.parent.slug)!.html).includes(faq.slug)) {
			throw new Error(`FAQ "${faq.parent.slug}": does not link to its child "${faq.slug}"`);
		}
	}
	return faqs.sort((a, b) => a.question.localeCompare(b.question));
}

const faqs: Faq[] = linkFaqs(
	await Promise.all(
		Object.entries(sources).map(([path, source]) => parseFaq(slugFromPath(path), source))
	)
);

export function allFaqs(): Faq[] {
	return faqs;
}

export function findFaq(slug: string): Faq | undefined {
	return faqs.find((faq) => faq.slug === slug);
}

export function faqsByCategory(): FaqCategory[] {
	return categories
		.map((name) => ({
			name,
			faqs: faqs
				.filter((faq) => faq.category === name && !faq.parent)
				.map(({ slug, question, summary, category }) => ({ slug, question, summary, category }))
		}))
		.filter((category) => category.faqs.length > 0);
}
