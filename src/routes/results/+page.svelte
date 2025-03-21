<script lang="ts">
	import { browser } from "$app/environment";
	import Thumbnail from "$lib/components/Thumbnail.svelte";
	import Youtube from "$lib/components/Youtube.svelte";
	import { YOUTUBE_EMBED } from "$lib/utils.js";

	let { data } = $props();

	function w() {
		return window.innerWidth < 500 ? (window.innerWidth < 400 ? window.innerWidth - 40 : 360) : 420;
	}
	let width = $state(browser ? w() : 0);
</script>

<svelte:window
	onresize={() => {
		width = w();
	}}
/>

<svelte:head>
	<title>Results &middot; SoME</title>
</svelte:head>

<section class="layout-prose pb-10 text-center">
	<p class=" mb-8 text-center text-4xl font-black">Results</p>
	<p>Find the winners of the 2024 edition</p>
	<div class="flex gap-2 justify-center">
		<a class="btn btn-neutral" href="/results/video">All videos</a>
		<a class="btn btn-neutral" href="/results/non-video">All non-videos</a>
	</div>
</section>

<section class="pb-28">
	<h2 class="mb-20 text-5xl font-black text-center">The top 5 entries are</h2>

	<div
		class="grid lg:grid-cols-2 max-w-4/5 sm:max-w-3/5 lg:max-w-4/5 mx-auto items-start content-center justify-center gap-x-4 lg:gap-x-8 gap-y-4 lg:gap-y-8"
	>
		{#each data.top.slice(0, 5) as winner}
			<div class="grid grid-cols-subgrid col-span-full max-w-3xl hover:bg-base-200 rounded-3xl p-6">
				{#if winner.category === "video"}
					<Youtube title={winner.title} src={winner.url}></Youtube>
				{:else if winner.thumbnail}
					<a href={winner.url} target="_blank">
						<Thumbnail uid={winner.thumbnail} {width}></Thumbnail>
					</a>
				{/if}

				<div class="md:mx-4 mt-4 lg:my-0">
					<a class="no-underline hover:underline" href={`/entries/${winner.uid}`}>
						<h3 class="mt-0 text-trim text-balance leading-snug mb-3">
							{winner.title}
						</h3>
					</a>
					<p class="line-clamp-4 lg:line-clamp-6 mb-0 leading-snug">{winner.description}</p>
				</div>
			</div>
		{/each}
	</div>
</section>

<section class="text-ligh bg-black/95 pb-32 pt-24 text-center">
	<div class="mx-auto max-w-prose">
		<h2 class="mt-0 mb-20 text-5xl font-black text-light-gold">The 20 honorable mentions</h2>
	</div>
	<div class="custom-grid px-4">
		{#each data.top.slice(5) as honorable}
			<div class="flex flex-col gap-3">
				<div>
					{#if honorable.category === "video" && honorable.url && YOUTUBE_EMBED.test(honorable.url)}
						<Youtube src={honorable.url}></Youtube>
					{:else if honorable.thumbnail && honorable.url && !YOUTUBE_EMBED.test(honorable.url)}
						<a href={honorable.url} target="_blank" class="w-[320px]">
							<Thumbnail uid={honorable.thumbnail} width={320}></Thumbnail>
						</a>
					{:else}
						<a href={honorable.url} target="_blank">{honorable.url} </a>
					{/if}
				</div>
				<div class="px-2">
					<h4 class="mt-0 line-clamp-2 text-balance">
						<a
							class="hover:underline text-light-gold no-underline"
							href={`/entries/${honorable.uid}`}
						>
							{honorable.title}
						</a>
					</h4>
				</div>
			</div>
		{/each}
	</div>
</section>

<section>
	<div class="text-center">
		<h2 class="mb-10 text-4xl font-black">All entries</h2>

		<p>You can find the whole ranking of entries here:</p>
		<div class="flex gap-2 justify-center">
			<a class="btn btn-neutral" href="/results/video">All videos</a>
			<a class="btn btn-neutral" href="/results/non-video">All non-videos</a>
		</div>
	</div>
</section>

<style>
	.custom-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 320px));
		justify-content: center;
		gap: calc(var(--spacing) * 12);
	}
</style>
