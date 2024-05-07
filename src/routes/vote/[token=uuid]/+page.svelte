<script lang="ts">
	import { categories, listFormatter } from '$lib/config';
	import { page } from '$app/stores';
	import { voteOpen } from '$lib/utils';
</script>

<article class="layout-prose">
	<h2>Vote</h2>
	{#if voteOpen()}
		<p>Choose a category:</p>
		<p class="flex gap-4">
			{#each categories as category}
				<a class="btn-primary btn" href={`/vote/${$page.params.token}/${category}`}
					>{category} entries</a
				>
			{/each}
		</p>
	{:else}
		<p>
			The vote is not open yet, but make sure to bookmark this page. When the vote will open, this
			is where you can select a category ({listFormatter.format(categories)}) to judge entries from.
		</p>
	{/if}
</article>
