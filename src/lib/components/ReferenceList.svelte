<script lang="ts">
	import type { Reference } from '#lib/faq.ts';

	let { references }: { references: Reference[] } = $props();
</script>

<section class="references" aria-labelledby="references-heading">
	<h2 id="references-heading">References</h2>
	<ol>
		{#each references as reference (reference.url)}
			<li>
				{reference.authors} ({reference.year}).
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external doi.org or PubMed links -->
				<a href={reference.url}><cite>{reference.title}</cite></a>.
				<i>{reference.journal}</i>.
				{#if reference.openAccess}
					<span class="reference-access">Open access</span>
				{/if}
			</li>
		{/each}
	</ol>
</section>
