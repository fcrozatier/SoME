<script lang="ts">
	import { categories } from "$lib/config";
	import { voteOpen } from "$lib/utils/time";
	import { setTitle } from "$lib/utils/setTitle";

	setTitle("Vote");
</script>

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
