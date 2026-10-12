<script lang="ts">
	import type { Snippet } from 'svelte';

	let { status, children }: { status: number; children: Snippet } = $props();
</script>

<div role="alert" data-tone="danger">
	<p><strong>{status}</strong> {@render children()}</p>
</div>
