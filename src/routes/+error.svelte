<script lang="ts">
	import { siteName } from '#lib/site.ts';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import DocumentHead from '#lib/components/DocumentHead.svelte';
	import ErrorMessage from '#lib/components/ErrorMessage.svelte';
	import TextLink from '#lib/components/TextLink.svelte';
</script>

<DocumentHead title="{page.status} · {siteName}" description={page.error?.message ?? 'Error'} />

<ErrorMessage status={page.status}>{page.error?.message}</ErrorMessage>
<TextLink href={resolve('/')}>Back to all questions</TextLink>
