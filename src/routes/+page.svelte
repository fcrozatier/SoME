<script lang="ts">
	import Media from "$lib/components/Media.svelte";
	import { currentYear, FULL_NAME, SHORT_NAME } from "$lib/config";
	import { makeTitle } from "$lib/utils/makeTitle.js";

	let { data } = $props();
</script>

<svelte:head>
	<title>{makeTitle("Home")}</title>
</svelte:head>

<section class="layout-prose">
	<!-- <p class=" mb-16 text-center text-3xl font-light">Create and discover new math content.</p> -->

	<p class=" mb-16 text-center text-3xl font-light">SoME4, summer 2025</p>
	<p>
		The {FULL_NAME} ({SHORT_NAME}) is an annual competition fostering the creation of excellent math
		content online. You can participate as either a creator or judge.
		<a href="/rules" rel="terms-of-service">Learn more</a>
	</p>
</section>

<!-- <Timeline></Timeline> -->

<!-- Last year -->
<section>
	<h2 class="mb-10 text-4xl font-black text-center text-balance">
		Top Entries from This Year's Peer Review
	</h2>

	<div
		class="grid max-w-5/6 sm:max-w-3/5 lg:max-w-4/5 mx-auto items-start content-center justify-center gap-x-4 lg:gap-x-8 gap-y-4 lg:gap-y-8"
	>
		{#each data.top.slice(0, 5) as top}
			<div class="max-w-3xl hover:bg-base-200 transition-colors duration-150 rounded-3xl p-6">
				<Media {...top} thumbnailWidth="360px" gap={8}></Media>
			</div>
		{/each}
	</div>
</section>

<!-- Prize -->
<section>
	<header class="max-w-prose mx-auto">
		<h2 class="mb-10 text-4xl text-center font-black text-balance">Teacher's Picks Award</h2>
		<p class="">
			These five entries received the <a href="/prize">SoME4 prize</a> for providing classroom-ready
			material that is particularly helpful to teachers.
			<a href="https://3blue1brown.substack.com/p/some4-prizes" target="_blank"
				>Read the announcement</a
			>
		</p>
	</header>

	<div
		class="grid max-w-5/6 sm:max-w-3/5 lg:max-w-4/5 mx-auto items-start content-center justify-center gap-x-4 lg:gap-x-8 gap-y-4 lg:gap-y-8"
	>
		{#each data.winners.slice(0, 5) as winner}
			<div class="max-w-3xl hover:bg-base-200 transition-colors duration-150 rounded-3xl p-6">
				<Media {...winner} thumbnailWidth="360px" gap={8}></Media>
			</div>
		{/each}
	</div>
</section>

<!-- Honorable mentions -->
<!-- <section class="text-ligh bg-black/95 pb-32 pt-24 text-center" style:color="var(--light-gold)">
	<div class="mx-auto max-w-prose">
		<h2 class="my-0 text-5xl font-black" style:color="var(--light-gold)">
			Last year's competition
		</h2>
		<p class="mt-8 font-light tracking-wider">
			Discover the 5 winners of the last edition. <br />

			The 20 honorable mentions as well as the full list of entries is available
			<a class="font-light" style:color="var(--light-gold)" href="/previous">here</a>
		</p>
	</div>
	<div class="mx-4">
		<div
			class="scrollbar mx-auto flex max-w-5xl snap-x snap-proximity snap-always items-center gap-10 overflow-x-scroll pb-2"
			style:--scrollbar-thumb="var(--light-gold)"
		>
			{#each winners as winner}
				<div class="snap-center">
					{#if winner.video}
						<Youtube src={winner.link}></Youtube>
					{:else}
						<a href={winner.link} target="_blank" class="inline-block w-[420px]">
							<img
								src={winner.thumbnail}
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
	</div>
</section> -->

<section>
	<div class="text-center">
		<h2 class="mb-10 text-4xl font-black">All entries</h2>
		<p>You can find the whole ranking of entries here:</p>
		<div class="flex gap-2 justify-center">
			<a class="btn btn-neutral" href={`/archive?category=video&year=${currentYear}&page=1`}
				>All videos</a
			>
			<a class="btn btn-neutral" href={`/archive?category=non-video&year=${currentYear}&page=1`}
				>All non-videos</a
			>
		</div>
	</div>
</section>

<!-- Sponsors -->
<section class="mt-10 pt-10 px-4">
	<h2 class="text-center mb-4 text-2xl font-light">
		Operations for this contest have been generously funded by
	</h2>
	<div class="flex items-center justify-center gap-20">
		<a href="https://www.3blue1brown.com/" rel="nofollow sponsored" target="_blank">
			<img
				class="opacity-20 hover:opacity-100 transition-opacity duration-200"
				src="/sponsors/3b1b-logo.png"
				alt="3Blue1Brown"
				width="50"
			/>
		</a>
		<a href="https://www.janestreet.com/" rel="nofollow sponsored" target="_blank">
			<img
				class="opacity-20 hover:opacity-100 transition-opacity duration-200"
				src="/sponsors/jane-street-logo.png"
				alt="Jane Street"
				width="180"
			/>
		</a>
		<a href="https://brilliant.org/" rel="nofollow sponsored" target="_blank">
			<img
				class="opacity-20 hover:opacity-100 transition-opacity duration-200"
				src="/sponsors/brilliant-logo.png"
				alt="Brilliant"
				title="Brilliant, Learn by doing"
				width="60"
			/>
		</a>
	</div>
</section>
