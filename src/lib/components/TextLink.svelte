<script lang="ts">
	import type { Snippet } from 'svelte';

	let { href, children }: { href: string; children: Snippet } = $props();
</script>

<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- callers pass resolved hrefs -->
<a {href}>{@render children()}</a>
