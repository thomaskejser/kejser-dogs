<script lang="ts">
	import type { FaqSummary } from '#lib/faq.ts';
	import FaqLink from './FaqLink.svelte';

	let { name, faqs }: { name: string; faqs: FaqSummary[] } = $props();
</script>

<section class="faq-category" aria-label={name}>
	<h2>{name}</h2>
	<ul>
		{#each faqs as faq (faq.slug)}
			<FaqLink slug={faq.slug} question={faq.question} summary={faq.summary} />
		{/each}
	</ul>
</section>
