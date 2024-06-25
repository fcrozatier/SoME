<script lang="ts">
	import { categories } from '$lib/config';
	import type { Page } from '@sveltejs/kit';
	import type { Readable } from 'svelte/store';

	export let page: Readable<Page<Record<string, string>>>;
	export let displayCategories: 'all' | 'others-only' = 'all';
</script>

{#if displayCategories !== 'others-only'}
	<p>
		<button class="btn-primary btn-lg btn">New vote</button>
	</p>
	<p>Or change category:</p>
{/if}
<p class="flex">
	{#each categories as category}
		{#if category !== $page.params.category}
			<!-- Force reload to grab a new entry -->
			<a
				class="btn"
				href={`/vote/${$page.params.token}/${category}?screen=ok`}
				data-sveltekit-reload>Go to {category} entries</a
			>
		{/if}
	{/each}
</p>
