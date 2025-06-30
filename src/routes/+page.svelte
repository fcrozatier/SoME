<script lang="ts">
	import Media from "$lib/components/Media.svelte";
	import Timeline from "$lib/components/Timeline.svelte";
	import { FULL_NAME, SHORT_NAME } from "$lib/config";
	import { setTitle } from "$lib/utils/setTitle.js";

	let { data } = $props();

	setTitle("Home");
</script>

<section class="layout-prose">
	<!-- <p class=" mb-16 text-center text-3xl font-light">Create and discover new math content.</p> -->

	<p class=" mb-16 text-center text-3xl font-light">SoME4, summer 2025</p>
	<p>
		The {FULL_NAME} ({SHORT_NAME}) is an annual competition fostering the creation of excellent math
		content online. You can participate as either a creator or judge.
		<a href="/rules" rel="terms-of-service">Learn more</a>
	</p>
</section>

<Timeline></Timeline>

<!-- Last year -->
<section>
	<h2 class="mb-10 text-4xl font-black text-center">Discover the top 5 of the last edition</h2>

	<div
		class="grid max-w-5/6 sm:max-w-3/5 lg:max-w-4/5 mx-auto items-start content-center justify-center gap-x-4 lg:gap-x-8 gap-y-4 lg:gap-y-8"
	>
		{#each data.top.slice(0, 5) as winner}
			<div class="max-w-3xl hover:bg-base-200 transition-colors duration-150 rounded-3xl p-6">
				<Media {...winner} thumbnailWidth="360px" gap={8}></Media>
			</div>
		{/each}
	</div>
</section>

<section>
	<div class="text-center">
		<h2 class="mb-10 text-4xl font-black">All entries</h2>
		<p>You can find the whole ranking of entries here:</p>
		<div class="flex gap-2 justify-center">
			<a class="btn btn-neutral" href="/archive?category=video&year=2024&page=1">All videos</a>
			<a class="btn btn-neutral" href="/archive?category=non-video&year=2024&page=1"
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
		<a href="https://www.janestreet.com/" rel="nofollow sponsored" target="_blank">
			<img
				class="opacity-20 hover:opacity-100 transition-opacity duration-200"
				src="/sponsors/jane-street-logo.webp"
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
		<a href="https://www.3blue1brown.com/" rel="nofollow sponsored" target="_blank">
			<img
				class="opacity-20 hover:opacity-100 transition-opacity duration-200"
				src="/sponsors/3b1b-logo.svg"
				alt="3Blue1Brown"
				width="50"
			/>
		</a>
	</div>
</section>
