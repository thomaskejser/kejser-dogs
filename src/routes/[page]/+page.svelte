<script lang="ts">
	import { siteName } from '#lib/site.ts';
	import DocumentHead from '#lib/components/DocumentHead.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import Prose from '#lib/components/Prose.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<DocumentHead title="{data.page.title} · {siteName}" description={data.page.description} />

<article>
	<PageHeader title={data.page.title}>
		{#snippet lead()}{data.page.description}{/snippet}
	</PageHeader>
	<Prose as="div" html={data.page.html} />
</article>
