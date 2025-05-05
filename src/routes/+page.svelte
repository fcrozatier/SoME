<script lang="ts">
	import Timeline from "$lib/components/Timeline.svelte";
	import { FULL_NAME, SHORT_NAME } from "$lib/config";
	import { setTitle } from "$lib/utils";
	import ResultsPage from "./results/+page.svelte";

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
<ResultsPage {data}></ResultsPage>

<!-- Sponsor -->
<section class="mt-10 pt-10">
	<h2 class="text-center mb-4 text-2xl font-light">
		Operations for this contest have been generously funded by
	</h2>
	<div class="flex justify-center">
		<a href="https://www.janestreet.com/" rel="nofollow sponsored" target="_blank">
			<img class="opacity-20" src="/jane-street-logo.webp" alt="Jane Street" width="200" />
		</a>
	</div>
</section>

<!-- Last year -->
<!-- <section class="text-ligh bg-black/95 pb-32 pt-24 text-center" style:color="var(--color-light-gold)">
	<div class="mx-auto max-w-prose">
		<h2 class="my-0 text-5xl font-black" style:color="var(--color-light-gold)">
			Last year's competition
		</h2>
		<p class="mt-8 font-light tracking-wider">
			Discover the 5 winners of the last edition. <br />

			The 20 honorable mentions as well as the full list of entries is available
			<a class="font-light" style:color="var(--color-light-gold)" href="/previous">here</a>
		</p>
	</div>
	<div class="mx-4">
		<div
			class="scrollbar mx-auto flex max-w-5xl snap-x snap-proximity snap-always items-center gap-10 overflow-x-scroll pb-2"
			style:--scrollbar-thumb="var(--color-light-gold)"
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
