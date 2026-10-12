<script lang="ts">
	import { resolve } from '$app/paths';

	let { slug, question, summary }: { slug: string; question: string; summary: string } = $props();
</script>

<li class="faq-link">
	<a href={resolve('/faq/[slug]', { slug })}>{question}</a>
	<p>{summary}</p>
</li>
