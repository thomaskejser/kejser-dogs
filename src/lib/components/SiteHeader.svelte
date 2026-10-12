<script lang="ts">
	import type { Snippet } from 'svelte';
	import { resolve } from '$app/paths';

	let { name, children }: { name: string; children?: Snippet } = $props();
</script>

<header class="site-header">
	<a class="site-name" href={resolve('/')}>{name}</a>
	{@render children?.()}
</header>
