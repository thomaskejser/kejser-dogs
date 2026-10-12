<script lang="ts">
	import { siteName } from '#lib/site.ts';
	import { resolve } from '$app/paths';
	import DocumentHead from '#lib/components/DocumentHead.svelte';
	import Breadcrumbs from '#lib/components/Breadcrumbs.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import Prose from '#lib/components/Prose.svelte';
	import ShortAnswer from '#lib/components/ShortAnswer.svelte';
	import ReferenceList from '#lib/components/ReferenceList.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<DocumentHead title="{data.faq.question} · {siteName}" description={data.faq.summary} />

<article>
	<Breadcrumbs
		crumbs={[
			{ label: 'All questions', href: resolve('/') },
			{ label: data.faq.category },
			...(data.faq.parent
				? [
						{
							label: data.faq.parent.question,
							href: resolve('/faq/[slug]', { slug: data.faq.parent.slug })
						}
					]
				: []),
			{ label: data.faq.question }
		]}
	/>
	<PageHeader title={data.faq.question} />
	<ShortAnswer>{data.faq.summary}</ShortAnswer>
	<Prose html={data.faq.html} />
	<ReferenceList references={data.faq.references} />
</article>
