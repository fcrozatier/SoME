<script lang="ts">
	import Thumbnail from '$lib/components/Thumbnail.svelte';
	import Youtube from '$lib/components/Youtube.svelte';
	import { YOUTUBE_EMBED } from '$lib/utils';

	export let data: {
		title?: string;
		description?: string;
		category?: string;
		url?: string;
		thumbnail?: string | null;
	};
</script>

<div>
	<h3>{data.title}</h3>
	<p>{data.description}</p>
	<div class="flex justify-center">
		{#if data.category === 'video' && data.url && YOUTUBE_EMBED.test(data.url)}
			<Youtube src={data.url} width={560}></Youtube>
		{:else if data.thumbnail && data.url && !YOUTUBE_EMBED.test(data.url)}
			<a href={data.url} target="_blank">
				<Thumbnail uid={data.thumbnail} width={560}></Thumbnail>
			</a>
		{/if}
	</div>
</div>
