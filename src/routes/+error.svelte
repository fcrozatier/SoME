<script lang="ts">
	import { page } from "$app/state";
	import { formatTitle } from "$lib/utils/formatting";
</script>

<svelte:head>
	<title>{formatTitle("Error")}</title>
</svelte:head>

<article class="layout-prose min-h-screen">
	<h2>{page.status}</h2>
	<p>
		{page.error?.message}
	</p>
	<p>
		<a href="/">Back</a>
	</p>
</article>
