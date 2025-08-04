<script lang="ts">
	import Thumbnail from "$lib/components/Thumbnail.svelte";
	import Youtube from "$lib/components/Youtube.svelte";
	import { YOUTUBE_EMBED } from "$lib/utils/regex";
	import { levels } from "$lib/validation";
	import Description from "./Description.svelte";

	interface Props {
		data: {
			title?: string;
			description?: string;
			category?: string;
			url?: string;
			thumbnail?: string | null;
			tags?: string[];
		};
	}

	let { data }: Props = $props();

	const audience = $derived(data.tags?.filter((tag) => levels.includes(tag)) ?? []);
	const otherTags = $derived(new Set(data.tags).difference(new Set(audience)));
</script>

<h3 class="mt-0">{data.title}</h3>

{#if data.tags && audience.length > 0}
	<p class="flex mt-0 gap-2 flex-wrap items-center mb-2">
		<b>Audience:</b>
		{#each audience as audience}
			<span class="tag">{audience}</span>
		{/each}
	</p>

	{#if otherTags.size > 0}
		<p class="flex mt-0 gap-2 flex-wrap items-center">
			<b>Tags:</b>
			{#each otherTags as tag}
				<span class="tag">{tag}</span>
			{/each}
		</p>
	{/if}
{/if}

{#if data.description}
	<Description content={data.description}></Description>
{/if}

<div class="flex justify-center">
	{#if data.category === "video" && data.url && YOUTUBE_EMBED.test(data.url)}
		<Youtube src={data.url} title={data.title}></Youtube>
	{:else if data.thumbnail && data.url && !YOUTUBE_EMBED.test(data.url)}
		<a href={data.url} target="_blank">
			<Thumbnail uid={data.thumbnail} width={560}></Thumbnail>
		</a>
	{:else}
		<a href={data.url} target="_blank">{data.url} </a>
	{/if}
</div>
