import { describe, expect, it } from 'vitest';
import { categories } from '#lib/faq.ts';
import { allFaqs, faqsByCategory, findFaq, linkFaqs, parseFaq } from './faq';

const valid = `---
question: Can dogs eat grapes?
summary: No. Grapes are toxic to dogs.
category: Nutrition
references:
  - authors: Smith A. et al.
    year: 2020
    title: Grape toxicity in dogs
    journal: Journal of Examples
    doi: 10.1234/example.1
    openAccess: true
---

Grapes and raisins can cause **kidney failure**.
`;

describe('parseFaq', () => {
	it('parses front matter and renders the answer to HTML', () => {
		const faq = parseFaq('grapes', valid);
		expect(faq).toMatchObject({
			slug: 'grapes',
			question: 'Can dogs eat grapes?',
			summary: 'No. Grapes are toxic to dogs.',
			category: 'Nutrition'
		});
		expect(faq.html).toContain('<strong>kidney failure</strong>');
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

	it('rejects a question with neither category nor parent', () => {
		const source = valid.replace('category: Nutrition\n', '');
		expect(() => parseFaq('grapes', source)).toThrow(/needs a category, or a parent/);
	});

	it('rejects a question with both category and parent', () => {
		const source = valid.replace('category: Nutrition', 'category: Nutrition\nparent: toxins');
		expect(() => parseFaq('grapes', source)).toThrow(/either a category or a parent/);
	});

	it('rejects a blank required field', () => {
		const source = valid.replace('summary: No. Grapes are toxic to dogs.', 'summary: "  "');
		expect(() => parseFaq('grapes', source)).toThrow(/"summary"/);
	});

	it('rejects unknown front matter fields', () => {
		const source = valid.replace('category: Nutrition', 'category: Nutrition\nauthor: Rex');
		expect(() => parseFaq('grapes', source)).toThrow(/unknown front matter field\(s\): author/);
	});

	it('rejects an empty answer body', () => {
		const source = valid.slice(0, valid.lastIndexOf('---') + 3);
		expect(() => parseFaq('grapes', source)).toThrow(/body is empty/);
	});

	it('rejects a category outside the fixed list', () => {
		const source = valid.replace('category: Nutrition', 'category: Health');
		expect(() => parseFaq('grapes', source)).toThrow(
			/category "Health" is not one of Nutrition, Aging, Care/
		);
	});

	it('rejects an answer without references', () => {
		const source = valid.replace(/references:[\s\S]*?openAccess: true\n/, '');
		expect(() => parseFaq('grapes', source)).toThrow(/at least one peer-reviewed source/);
	});

	it('rejects a slug that is not kebab-case', () => {
		expect(() => parseFaq('Grapes_Toxic', valid)).toThrow(/kebab-case/);
	});
});

function faq(slug: string, frontMatter: string, body = 'Body.'): string {
	return valid
		.replace('category: Nutrition', frontMatter)
		.replace('Grapes and raisins can cause **kidney failure**.', body);
}

describe('linkFaqs', () => {
	const hub = parseFaq('toxins', faq('toxins', 'category: Nutrition', '- [Grapes](/faq/grapes)'));
	const child = parseFaq('grapes', faq('grapes', 'parent: toxins'));

	it("gives a child its parent and its parent's category", () => {
		const linked = linkFaqs([hub, child]);
		expect(linked.find((item) => item.slug === 'grapes')).toMatchObject({
			category: 'Nutrition',
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

	it('rejects a parent that has a parent itself', () => {
		const grandchild = parseFaq('raisins', faq('raisins', 'parent: grapes'));
		const linkingChild = parseFaq(
			'grapes',
			faq('grapes', 'parent: toxins', '- [Raisins](/faq/raisins)')
		);
		expect(() => linkFaqs([hub, linkingChild, grandchild])).toThrow(/has a parent itself/);
	});

	it('rejects a parent that does not link to its child', () => {
		const silentHub = parseFaq('toxins', faq('toxins', 'category: Nutrition', 'No links.'));
		expect(() => linkFaqs([silentHub, child])).toThrow(/does not link to its child "grapes"/);
	});

	it('rejects a link to a question that does not exist', () => {
		const broken = parseFaq('toxins', faq('toxins', 'category: Nutrition', '[x](/faq/nope)'));
		expect(() => linkFaqs([broken])).toThrow(/links to missing question\(s\): nope/);
	});
});

describe('content', () => {
	it('loads every FAQ in content/faq', () => {
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
