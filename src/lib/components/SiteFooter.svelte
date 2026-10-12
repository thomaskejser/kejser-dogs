<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<footer class="site-footer">
	{@render children()}
</footer>
