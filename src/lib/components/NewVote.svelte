<script lang="ts">
	import { categories } from "$lib/config";
	import { page } from "$app/state";

	interface Props {
		displayCategories?: "all" | "others-only";
	}

	let { displayCategories = "all" }: Props = $props();
</script>

{#if displayCategories !== "others-only"}
	<p>
		<button class="btn-neutral btn-lg btn">New vote</button>
	</p>
	<p>Or change category:</p>
{/if}
<p class="flex">
	{#each categories as category}
		{#if category !== page.params.category}
			<!-- Force reload to grab a new entry -->
			<a class="btn" href={`/user/vote/${category}?screen=ok`} data-sveltekit-reload
				>Go to {category} entries</a
			>
		{/if}
	{/each}
</p>
