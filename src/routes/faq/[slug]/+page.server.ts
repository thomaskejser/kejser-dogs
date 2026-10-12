import { error } from '@sveltejs/kit';
import { allFaqs, findFaq } from '#lib/server/faq.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => allFaqs().map(({ slug }) => ({ slug }));

export const load: PageServerLoad = ({ params }) => {
	const faq = findFaq(params.slug);
	if (!faq) {
		error(404, 'No such question');
	}
	return { faq };
};
