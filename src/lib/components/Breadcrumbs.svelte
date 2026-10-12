<script lang="ts" module>
	export type Crumb = { label: string; href?: string };
</script>

<script lang="ts">
	let { crumbs }: { crumbs: Crumb[] } = $props();
</script>

<nav class="breadcrumbs" aria-label="Breadcrumb">
	<ol>
		{#each crumbs as crumb, index (index)}
			<li>
				{#if crumb.href}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- callers pass resolved hrefs -->
					<a href={crumb.href}>{crumb.label}</a>
				{:else if index === crumbs.length - 1}
					<span aria-current="page">{crumb.label}</span>
				{:else}
					<span>{crumb.label}</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
