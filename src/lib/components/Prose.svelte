<script lang="ts">
	let { html }: { html: string } = $props();
</script>

<div class="prose">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- html is rendered at build time from Markdown in this repo -->
	{@html html}
</div>
