<script lang="ts">
	import Thumbnail from '$lib/components/Thumbnail.svelte';
	import Youtube from '$lib/components/Youtube.svelte';

	export let data;
</script>

<svelte:head>
	<title>Results &middot; SoME</title>
</svelte:head>

<section class="layout-prose pb-10">
	<p class=" mb-16 text-center text-3xl font-light">Results</p>
	<p>
		You can find the 2024 winners below. The full list of video entries is available <a
			href="/results/video">here</a
		>. The full list of non-video entries is available <a href="/results/non-video">here</a>.
	</p>
</section>

<section class="pb-28">
	<h2 class="mb-20 text-5xl font-black text-center">The top 5 entries are</h2>

	<div
		class="grid lg:grid-cols-2 items-start content-center justify-center gap-x-4 lg:gap-x-8 lg:gap-y-20"
	>
		{#each data.top.slice(0, 5) as winner}
			<div class="ml-auto px-4">
				{#if winner.category === 'video'}
					<Youtube width={420} src={winner.url}></Youtube>
				{:else if winner.thumbnail}
					<a href={winner.url} target="_blank" class="w-[420px]">
						<Thumbnail uid={winner.thumbnail} width={420}></Thumbnail>
					</a>
				{/if}
			</div>
			<div class="max-w-sm mx-4 mb-10 lg:mb-0">
				<h3 class="mt-2 mb-3">{winner.title}</h3>
				<p class="line-clamp-6 leading-snug">{winner.description}</p>
			</div>
		{/each}
	</div>
</section>

<section class="text-ligh bg-black/95 pb-32 pt-24 text-center" style:color="var(--light-gold)">
	<div class="mx-auto max-w-prose">
		<h2 class="mt-0 text-5xl font-black" style:color="var(--light-gold)">
			The 20 honorable mentions
		</h2>
	</div>
	<div class="custom-grid px-4">
		{#each data.top.slice(5) as honorable}
			<div class="flex flex-col gap-3">
				<div>
					{#if honorable.category === 'video'}
						<Youtube width={360} src={honorable.url}></Youtube>
					{:else if honorable.thumbnail}
						<a href={honorable.url} target="_blank" class="w-[420px]">
							<Thumbnail uid={honorable.thumbnail} width={360}></Thumbnail>
						</a>
					{/if}
				</div>
				<div class="px-2">
					<h4 class="mt-0" style:color="var(--light-gold)">{honorable.title}</h4>
				</div>
			</div>
		{/each}
	</div>
</section>

<section>
	<div class="text-center">
		<h2 class="mb-10 text-4xl font-black">All entries</h2>

		<p>You can find the whole ranking of entries here:</p>
		<div>
			<a href="/results/video"><button class="btn btn-primary">All videos</button></a>
			<a href="/results/non-video"><button class="btn btn-primary">All non-videos</button></a>
		</div>
	</div>
</section>

<style>
	.custom-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 320px));
		justify-content: center;
		gap: theme(space.12) theme(space.16);
	}
</style>
