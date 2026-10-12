export type Reference = {
	authors: string;
	year: number;
	title: string;
	journal: string;
	doi: string | undefined;
	pmid: string | undefined;
	url: string;
	openAccess: boolean;
};

export const categories = ['Nutrition', 'Aging', 'Care'] as const;

export type Category = (typeof categories)[number];

export type FaqSummary = {
	slug: string;
	question: string;
	summary: string;
	category: Category;
};

export type FaqParent = {
	slug: string;
	question: string;
};

export type Faq = FaqSummary & {
	html: string;
	references: Reference[];
	parent: FaqParent | undefined;
};

export type FaqCategory = {
	name: Category;
	faqs: FaqSummary[];
};
