export function slugFromPath(path: string): string {
	return path.slice(path.lastIndexOf('/') + 1, -'.md'.length);
}

export function checkFrontMatter(
	frontMatter: Record<string, unknown>,
	allowed: readonly string[],
	where: string
): void {
	const unknown = Object.keys(frontMatter).filter((field) => !allowed.includes(field));
	if (unknown.length > 0) {
		throw new Error(`${where}: unknown front matter field(s): ${unknown.join(', ')}`);
	}
}

export function requireText(
	frontMatter: Record<string, unknown>,
	field: string,
	where: string
): string {
	const value = frontMatter[field];
	if (typeof value !== 'string' || value.trim() === '') {
		throw new Error(`${where}: front matter field "${field}" must be a non-empty string`);
	}
	return value.trim();
}
