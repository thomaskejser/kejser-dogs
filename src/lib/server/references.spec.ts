import { describe, expect, it } from 'vitest';
import { parseReferences } from './references';

function without(field: string): Record<string, unknown> {
	const entry: Record<string, unknown> = { ...reference };
	delete entry[field];
	return entry;
}

const reference = {
	authors: 'Hare B. et al.',
	year: 2002,
	title: 'The domestication of social cognition in dogs',
	journal: 'Science',
	doi: '10.1126/science.1072702',
	openAccess: true
};

describe('parseReferences', () => {
	it('accepts a complete reference and links it through doi.org', () => {
		expect(parseReferences([reference], 'FAQ "x"')).toEqual([
			{ ...reference, pmid: undefined, url: 'https://doi.org/10.1126/science.1072702' }
		]);
	});

	it('accepts a PubMed ID instead of a DOI and links to PubMed', () => {
		const [parsed] = parseReferences([{ ...without('doi'), pmid: 10670081 }], 'FAQ "x"');
		expect(parsed).toMatchObject({
			doi: undefined,
			pmid: '10670081',
			url: 'https://pubmed.ncbi.nlm.nih.gov/10670081/'
		});
	});

	it('prefers the DOI link when both identifiers are given', () => {
		const [parsed] = parseReferences([{ ...reference, pmid: '12493993' }], 'FAQ "x"');
		expect(parsed.url).toBe('https://doi.org/10.1126/science.1072702');
	});

	it('rejects a reference with neither DOI nor PubMed ID', () => {
		expect(() => parseReferences([without('doi')], 'FAQ "x"')).toThrow(/needs a "doi" or/);
	});

	it('rejects a PubMed ID that is not a number', () => {
		expect(() => parseReferences([{ ...without('doi'), pmid: 'PMC1686341' }], 'FAQ "x"')).toThrow(
			/"pmid" must be a PubMed ID/
		);
	});

	it('rejects the same PubMed ID twice', () => {
		const entry = { ...without('doi'), pmid: 10670081 };
		expect(() => parseReferences([entry, { ...entry }], 'FAQ "x"')).toThrow(/pmid:10670081/);
	});

	it('rejects a missing or empty list', () => {
		expect(() => parseReferences(undefined, 'FAQ "x"')).toThrow(/at least one/);
		expect(() => parseReferences([], 'FAQ "x"')).toThrow(/at least one/);
	});

	it('rejects a DOI given as a URL', () => {
		const entry = { ...reference, doi: 'https://doi.org/10.1126/science.1072702' };
		expect(() => parseReferences([entry], 'FAQ "x"')).toThrow(/bare DOI/);
	});

	it('rejects a missing field', () => {
		expect(() => parseReferences([without('journal')], 'FAQ "x"')).toThrow(
			/reference 1: "journal"/
		);
	});

	it('rejects an unknown field', () => {
		expect(() => parseReferences([{ ...reference, url: 'x' }], 'FAQ "x"')).toThrow(
			/unknown field\(s\): url/
		);
	});

	it('rejects a year that is not a number', () => {
		expect(() => parseReferences([{ ...reference, year: '2002' }], 'FAQ "x"')).toThrow(/"year"/);
	});

	it('requires open access to be stated', () => {
		expect(() => parseReferences([without('openAccess')], 'FAQ "x"')).toThrow(/"openAccess"/);
	});

	it('rejects the same DOI twice', () => {
		expect(() => parseReferences([reference, { ...reference }], 'FAQ "x"')).toThrow(/listed twice/);
	});
});
