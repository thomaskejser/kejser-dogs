import { faqsByCategory } from '#lib/server/faq.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ categories: faqsByCategory() });
