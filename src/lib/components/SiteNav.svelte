<script lang="ts" module>
	export type NavItem = { label: string; href: string };
</script>

<script lang="ts">
	let { items, current }: { items: NavItem[]; current: Pick<URL, 'href' | 'pathname'> } = $props();

	const isCurrent = (href: string) => new URL(href, current.href).pathname === current.pathname;
</script>

<nav class="site-nav" aria-label="Main">
	<ul>
		{#each items as item (item.href)}
			<li>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- callers pass resolved hrefs -->
				<a href={item.href} aria-current={isCurrent(item.href) ? 'page' : undefined}>{item.label}</a
				>
			</li>
		{/each}
	</ul>
</nav>
