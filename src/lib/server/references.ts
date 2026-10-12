import type { Reference } from '#lib/faq.ts';

const doiPattern = /^10\.\d{4,9}\/\S+$/;
const pmidPattern = /^[1-9]\d{0,8}$/;
const fields = ['authors', 'year', 'title', 'journal', 'doi', 'pmid', 'openAccess'];

function requireText(entry: Record<string, unknown>, field: string, where: string): string {
	const value = entry[field];
	if (typeof value !== 'string' || value.trim() === '') {
		throw new Error(`${where}: "${field}" must be a non-empty string`);
	}
	return value.trim();
}

function parseDoi(value: unknown, where: string): string | undefined {
	if (value === undefined) {
		return undefined;
	}
	if (typeof value !== 'string' || !doiPattern.test(value.trim())) {
		throw new Error(`${where}: "doi" must be a bare DOI such as 10.1000/xyz, not a URL`);
	}
	return value.trim();
}

function parsePmid(value: unknown, where: string): string | undefined {
	if (value === undefined) {
		return undefined;
	}
	const text = typeof value === 'number' ? String(value) : value;
	if (typeof text !== 'string' || !pmidPattern.test(text.trim())) {
		throw new Error(`${where}: "pmid" must be a PubMed ID, a number such as 10670081`);
	}
	return text.trim();
}

function parseReference(entry: unknown, where: string): Reference {
	if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
		throw new Error(`${where}: must be a mapping of ${fields.join(', ')}`);
	}
	const record = entry as Record<string, unknown>;
	const unknown = Object.keys(record).filter((field) => !fields.includes(field));
	if (unknown.length > 0) {
		throw new Error(`${where}: unknown field(s): ${unknown.join(', ')}`);
	}
	const { year, openAccess } = record;
	if (typeof year !== 'number' || !Number.isInteger(year) || year < 1800 || year > 2100) {
		throw new Error(`${where}: "year" must be a four-digit year`);
	}
	if (typeof openAccess !== 'boolean') {
		throw new Error(`${where}: "openAccess" must be true or false`);
	}
	const doi = parseDoi(record.doi, where);
	const pmid = parsePmid(record.pmid, where);
	if (doi === undefined && pmid === undefined) {
		throw new Error(`${where}: needs a "doi" or, for a paper without one, a "pmid"`);
	}
	return {
		authors: requireText(record, 'authors', where),
		year,
		title: requireText(record, 'title', where),
		journal: requireText(record, 'journal', where),
		doi,
		pmid,
		url: doi ? `https://doi.org/${doi}` : `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
		openAccess
	};
}

function identifiers(reference: Reference): string[] {
	return [reference.doi?.toLowerCase(), reference.pmid && `pmid:${reference.pmid}`].filter(
		(id): id is string => Boolean(id)
	);
}

export function parseReferences(value: unknown, where: string): Reference[] {
	if (!Array.isArray(value) || value.length === 0) {
		throw new Error(`${where}: "references" must list at least one peer-reviewed source`);
	}
	const references = value.map((entry, index) =>
		parseReference(entry, `${where}: reference ${index + 1}`)
	);
	const ids = references.flatMap(identifiers);
	const duplicate = ids.find((id, index) => ids.indexOf(id) !== index);
	if (duplicate) {
		throw new Error(`${where}: reference ${duplicate} is listed twice`);
	}
	return references;
}
