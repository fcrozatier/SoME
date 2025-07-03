<script lang="ts">
	import { categories } from "$lib/config";
	import { makeTitle } from "$lib/utils/makeTitle";
	import { voteOpen } from "$lib/utils/time";
</script>

<svelte:head>
	<title>{makeTitle("Vote")}</title>
</svelte:head>

<article class="layout-prose">
	<h2>Vote</h2>
	{#if voteOpen()}
		<p>Choose a category:</p>
		<p class="flex gap-4">
			{#each categories.toReversed() as category}
				<a class="btn-neutral btn" href={`/user/vote/${category}`}>{category}</a>
			{/each}
		</p>
	{:else}
		<p>The vote is not open yet.</p>
	{/if}
</article>
