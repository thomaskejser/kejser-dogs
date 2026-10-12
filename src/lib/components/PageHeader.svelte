<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, lead }: { title: string; lead?: Snippet } = $props();
</script>

<hgroup>
	<h1>{title}</h1>
	{#if lead}
		<p>{@render lead()}</p>
	{/if}
</hgroup>
