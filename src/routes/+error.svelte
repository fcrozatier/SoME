<script lang="ts">
	import { page } from "$app/state";
	import { titleSnippet } from "$lib/components/snippets.svelte";
</script>

<svelte:head>
	{@render titleSnippet("Error")}
</svelte:head>

<article class="layout-prose min-h-[100vh]">
	<h2>{page.status}</h2>
	<p>
		{page.error?.message}
	</p>
	<p>
		<a href="/">Back</a>
	</p>
</article>
