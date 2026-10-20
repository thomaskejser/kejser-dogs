import { beforeAll, describe, expect, it } from 'vitest';
import { categories } from '#lib/faq.ts';
import { allFaqs, faqsByCategory, findFaq, linkFaqs, parseFaq } from './faq';
import type { FaqSource } from './faq';

const valid = `---
summary: No. Grapes are toxic to dogs.
category: Nutrition and feeding
references:
  - authors: Smith A. et al.
    year: 2020
    title: Grape toxicity in dogs
    journal: Journal of Examples
    doi: 10.1234/example.1
    openAccess: true
---

# Can dogs eat grapes?

Grapes and raisins can cause **kidney failure**.
`;

describe('parseFaq', () => {
	it('parses front matter and renders the answer to HTML', async () => {
		const faq = await parseFaq('grapes', valid);
		expect(faq).toMatchObject({
			slug: 'grapes',
			question: 'Can dogs eat grapes?',
			summary: 'No. Grapes are toxic to dogs.',
			category: 'Nutrition and feeding'
		});
		expect(faq.html).toContain('<strong>kidney failure</strong>');
		expect(faq.html).not.toContain('<h1');
		expect(faq.references).toEqual([
			{
				authors: 'Smith A. et al.',
				year: 2020,
				title: 'Grape toxicity in dogs',
				journal: 'Journal of Examples',
				doi: '10.1234/example.1',
				pmid: undefined,
				url: 'https://doi.org/10.1234/example.1',
				openAccess: true
			}
		]);
	});

	it('rejects a question with neither category nor parent', async () => {
		const source = valid.replace('category: Nutrition and feeding\n', '');
		await expect(parseFaq('grapes', source)).rejects.toThrow(/needs a category, or a parent/);
	});

	it('rejects a question with both category and parent', async () => {
		const source = valid.replace(
			'category: Nutrition and feeding',
			'category: Nutrition and feeding\nparent: toxins'
		);
		await expect(parseFaq('grapes', source)).rejects.toThrow(/either a category or a parent/);
	});

	it('rejects a blank required field', async () => {
		const source = valid.replace('summary: No. Grapes are toxic to dogs.', 'summary: "  "');
		await expect(parseFaq('grapes', source)).rejects.toThrow(/"summary"/);
	});

	it('rejects unknown front matter fields', async () => {
		const source = valid.replace(
			'category: Nutrition and feeding',
			'category: Nutrition and feeding\nauthor: Rex'
		);
		await expect(parseFaq('grapes', source)).rejects.toThrow(
			/unknown front matter field\(s\): author/
		);
	});

	it('rejects an empty answer body', async () => {
		const source = valid.slice(0, valid.lastIndexOf('---') + 3);
		await expect(parseFaq('grapes', source)).rejects.toThrow(/body is empty/);
	});

	it('rejects a category outside the fixed list', async () => {
		const source = valid.replace('category: Nutrition and feeding', 'category: Health');
		await expect(parseFaq('grapes', source)).rejects.toThrow(
			/category "Health" is not one of Nutrition and feeding, Aging, Care, Breeds, Behavior/
		);
	});

	it('rejects an answer without references', async () => {
		const source = valid.replace(/references:[\s\S]*?openAccess: true\n/, '');
		await expect(parseFaq('grapes', source)).rejects.toThrow(/at least one peer-reviewed source/);
	});

	it('rejects a question in front matter', async () => {
		const source = valid.replace('summary:', 'question: Can dogs eat grapes?\nsummary:');
		await expect(parseFaq('grapes', source)).rejects.toThrow(
			/unknown front matter field\(s\): question/
		);
	});

	it('rejects a relative link to a file that is not Markdown', async () => {
		const source = valid.replace('**kidney failure**', '[x](grapes.html)');
		await expect(parseFaq('grapes', source)).rejects.toThrow(/must point to a .md file/);
	});

	it('rejects a slug that is not kebab-case', async () => {
		await expect(parseFaq('Grapes_Toxic', valid)).rejects.toThrow(/kebab-case/);
	});
});

function faq(slug: string, frontMatter: string, body = 'Body.'): string {
	return valid
		.replace('category: Nutrition and feeding', frontMatter)
		.replace('Grapes and raisins can cause **kidney failure**.', body);
}

describe('linkFaqs', () => {
	let hub: FaqSource;
	let child: FaqSource;

	beforeAll(async () => {
		hub = await parseFaq(
			'toxins',
			faq('toxins', 'category: Nutrition and feeding', '- [Grapes](grapes.md)')
		);
		child = await parseFaq('grapes', faq('grapes', 'parent: toxins'));
	});

	it("gives a child its parent and its parent's category", () => {
		const linked = linkFaqs([hub, child]);
		expect(linked.find((item) => item.slug === 'grapes')).toMatchObject({
			category: 'Nutrition and feeding',
			parent: { slug: 'toxins', question: 'Can dogs eat grapes?' }
		});
		expect(linked.find((item) => item.slug === 'toxins')?.parent).toBeUndefined();
	});

	it('leaves children off the front page', () => {
		expect(linkFaqs([hub, child]).filter((item) => !item.parent)).toHaveLength(1);
	});

	it('rejects a parent that does not exist', () => {
		expect(() => linkFaqs([child])).toThrow(/parent "toxins" does not exist/);
	});

	it('rejects a parent that has a parent itself', async () => {
		const grandchild = await parseFaq('raisins', faq('raisins', 'parent: grapes'));
		const linkingChild = await parseFaq(
			'grapes',
			faq('grapes', 'parent: toxins', '- [Raisins](raisins.md)')
		);
		expect(() => linkFaqs([hub, linkingChild, grandchild])).toThrow(/has a parent itself/);
	});

	it('rejects a parent that does not link to its child', async () => {
		const silentHub = await parseFaq(
			'toxins',
			faq('toxins', 'category: Nutrition and feeding', 'No links.')
		);
		expect(() => linkFaqs([silentHub, child])).toThrow(/does not link to its child "grapes"/);
	});

	it('rejects a link to a question that does not exist', async () => {
		const broken = await parseFaq(
			'toxins',
			faq('toxins', 'category: Nutrition and feeding', '[x](nope.md)')
		);
		expect(() => linkFaqs([broken])).toThrow(/links to missing question\(s\): nope/);
	});
});

describe('content', () => {
	it('loads every FAQ in src/content/faq', () => {
		expect(allFaqs().length).toBeGreaterThan(0);
	});

	it('finds a FAQ by slug and returns undefined for an unknown slug', () => {
		const first = allFaqs()[0];
		expect(findFaq(first.slug)).toBe(first);
		expect(findFaq('no-such-question')).toBeUndefined();
	});

	it('gives every FAQ at least one reference', () => {
		for (const faq of allFaqs()) {
			expect(faq.references.length, faq.slug).toBeGreaterThan(0);
		}
	});

	it('orders categories as listed, omitting empty ones', () => {
		const names = faqsByCategory().map((category) => category.name);
		expect(names).toEqual(categories.filter((name) => names.includes(name)));
	});

	it('lists every top-level FAQ under exactly one category', () => {
		const grouped = faqsByCategory().flatMap((category) => category.faqs);
		expect(grouped.map((item) => item.slug).sort()).toEqual(
			allFaqs()
				.filter((item) => !item.parent)
				.map((item) => item.slug)
				.sort()
		);
		expect(grouped[0]).not.toHaveProperty('html');
	});
});
