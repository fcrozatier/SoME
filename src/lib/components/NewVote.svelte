<script lang="ts">
	import { categories } from '$lib/config';

	export let page;
	export let displayCategories: 'all' | 'others-only' = 'all';
</script>

<!-- Force reload to grab a new pair of entries -->
{#if displayCategories !== 'others-only'}
	<p>
		<a
			class="btn-primary btn-lg btn"
			href={`/vote/${$page.params.token}/${$page.params.category}`}
			data-sveltekit-reload>New vote</a
		>
	</p>
	<p>Or change category:</p>
{/if}
<p class="flex">
	{#each categories as category}
		{#if category !== $page.params.category}
			<a class="btn" href={`/vote/${$page.params.token}/${category}`} data-sveltekit-reload
				>Go to {category} entries</a
			>
		{/if}
	{/each}
</p>
