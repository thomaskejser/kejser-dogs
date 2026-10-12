<script lang="ts">
	import { resolve } from '$app/paths';
	import { siteName } from '#lib/site.ts';
	import DocumentHead from '#lib/components/DocumentHead.svelte';
	import ErrorMessage from '#lib/components/ErrorMessage.svelte';
	import TextLink from '#lib/components/TextLink.svelte';
</script>

<DocumentHead title="Page not found · {siteName}" description="This page does not exist." />

<ErrorMessage status={404}>This page does not exist.</ErrorMessage>
<TextLink href={resolve('/')}>Back to all questions</TextLink>
