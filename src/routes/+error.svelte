<script lang="ts">
	import { page } from "$app/state";
	import { makeTitle } from "$lib/utils/makeTitle";
</script>

<svelte:head>
	<title>{makeTitle("Error")}</title>
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
