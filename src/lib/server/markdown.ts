import matter from 'gray-matter';
import { marked } from 'marked';

export type MarkdownDocument<Field extends string, Structured extends string> = {
	slug: string;
	fields: Record<Field, string>;
	structured: Record<Structured, unknown>;
	html: string;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugFromPath(path: string): string {
	return path.slice(path.lastIndexOf('/') + 1, -'.md'.length);
}

export function parseMarkdown<Field extends string, Structured extends string = never>(
	kind: string,
	slug: string,
	source: string,
	required: readonly Field[],
	structured: readonly Structured[] = []
): MarkdownDocument<Field, Structured> {
	if (!slugPattern.test(slug)) {
		throw new Error(`${kind} "${slug}": file name must be lowercase kebab-case`);
	}
	const { data, content } = matter(source);
	const allowed = new Set<string>([...required, ...structured]);
	const unknown = Object.keys(data).filter((field) => !allowed.has(field));
	if (unknown.length > 0) {
		throw new Error(`${kind} "${slug}": unknown front matter field(s): ${unknown.join(', ')}`);
	}
	if (content.trim() === '') {
		throw new Error(`${kind} "${slug}": body is empty`);
	}
	const fields = {} as Record<Field, string>;
	for (const field of required) {
		const value = data[field];
		if (typeof value !== 'string' || value.trim() === '') {
			throw new Error(
				`${kind} "${slug}": front matter field "${field}" must be a non-empty string`
			);
		}
		fields[field] = value.trim();
	}
	const structuredData = {} as Record<Structured, unknown>;
	for (const field of structured) {
		structuredData[field] = data[field];
	}
	return {
		slug,
		fields,
		structured: structuredData,
		html: marked.parse(content, { async: false })
	};
}
