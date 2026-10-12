<script lang="ts">
	import { siteName, siteTagline } from '#lib/site.ts';
	import DocumentHead from '#lib/components/DocumentHead.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import FaqCategory from '#lib/components/FaqCategory.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<DocumentHead title={siteName} description={siteTagline} />

<PageHeader title={siteName}>
	{#snippet lead()}{siteTagline}{/snippet}
</PageHeader>

{#each data.categories as category (category.name)}
	<FaqCategory name={category.name} faqs={category.faqs} />
{/each}
