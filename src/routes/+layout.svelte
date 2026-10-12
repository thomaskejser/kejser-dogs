<script lang="ts">
	import { siteName } from '#lib/site.ts';
	import '#lib/styles/app.css';
	import { asset, resolve } from '$app/paths';
	import { page } from '$app/state';
	import favicon from '#lib/assets/favicon.svg';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import SiteNav from '#lib/components/SiteNav.svelte';
	import SiteFooter from '#lib/components/SiteFooter.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} type="image/svg+xml" />
	<link rel="apple-touch-icon" href={asset('apple-touch-icon.png')} />
</svelte:head>

<SiteHeader name={siteName}>
	<SiteNav
		items={[
			{ label: 'Questions', href: resolve('/') },
			{ label: 'Sources', href: resolve('/[page]', { page: 'sources' }) },
			{ label: 'About', href: resolve('/[page]', { page: 'about' }) }
		]}
		current={page.url}
	/>
</SiteHeader>
<main>
	{@render children()}
</main>
<SiteFooter>General information only — ask your vet about your own dog's health.</SiteFooter>
