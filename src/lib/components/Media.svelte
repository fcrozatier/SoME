<script lang="ts">
	import { YOUTUBE_EMBED } from "$lib/utils";
	import LayoutSideBySide from "./layouts/LayoutSideBySide.svelte";
	import Thumbnail from "./Thumbnail.svelte";
	import Youtube from "./Youtube.svelte";

	type Props = {
		category: "video" | "non-video";
		uid: string;
		title: string;
		description: string;
		url: string;
		thumbnail?: string | null;
		/**
		 * Pixel width of the thumbnail
		 */
		thumbnailWidth: `${number}px`;
		gap?: number;
	};

	let { category, uid, url, title, description, thumbnail, thumbnailWidth, gap }: Props = $props();
</script>

<LayoutSideBySide side="left" sideWidth={thumbnailWidth} contentMinSize="40%" {gap}>
	{#snippet sidePanel()}
		{#if category === "video" && url && YOUTUBE_EMBED.test(url)}
			{#key url}
				<Youtube src={url} {title}></Youtube>
			{/key}
		{:else if thumbnail && url && !YOUTUBE_EMBED.test(url)}
			<a href={url} target="_blank">
				<Thumbnail uid={thumbnail} width={thumbnailWidth.replace("px", "")}></Thumbnail>
			</a>
		{:else}
			<a href={url} class="line-clamp-1 wrap-anywhere" target="_blank">{url}</a>
		{/if}
	{/snippet}
	{#snippet mainPanel()}
		<a class="no-underline hover:underline" href={`/entries/${uid}`}>
			<h3 class="mt-0 text-trim text-balance line-clamp-2 leading-snug mb-3">{title}</h3>
		</a>
		{#if description}
			<p class="line-clamp-3">{description}</p>
		{/if}
	{/snippet}
</LayoutSideBySide>
