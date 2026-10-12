import { error } from '@sveltejs/kit';
import { allPages, findPage } from '#lib/server/pages.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => allPages().map(({ slug }) => ({ page: slug }));

export const load: PageServerLoad = ({ params }) => {
	const page = findPage(params.page);
	if (!page) {
		error(404, 'No such page');
	}
	return { page };
};
