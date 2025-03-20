<script lang="ts">
	import type { SelectEntry } from "$lib/server/db/schema";
	import Youtube from "./Youtube.svelte";

	interface Props {
		entries: Pick<SelectEntry, "category" | "url" | "thumbnail">[];
	}

	let { entries }: Props = $props();
</script>

<div
	class="scrollbar mx-auto flex max-w-5xl snap-x snap-proximity snap-always items-center gap-10 overflow-x-scroll pb-2"
	style:--scrollbar-thumb="var(--color-light-gold)"
>
	{#each entries as entry}
		<div class="snap-center">
			{#if entry.category === "video"}
				<Youtube src={entry.url}></Youtube>
			{:else}
				<a href={entry.url} target="_blank" class="inline-block w-[420px]">
					<img
						src={entry.thumbnail}
						alt="Winner thumbnail"
						width="420"
						class="aspect-video rounded-lg"
						loading="lazy"
					/>
				</a>
			{/if}
		</div>
	{/each}
</div>
