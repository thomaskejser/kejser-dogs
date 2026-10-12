<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<section class="short-answer" aria-labelledby="short-answer-heading">
	<h2 id="short-answer-heading">Short Answer</h2>
	<p>{@render children()}</p>
</section>
