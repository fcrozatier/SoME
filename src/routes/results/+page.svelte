<script lang="ts">
	import Carousel from '$lib/components/Carousel.svelte';

	export let data;
</script>

<svelte:head>
	<title>Results &middot; SoME</title>
</svelte:head>

<section class="text-center">
	<h2 class="text-3xl mt-10 font-light">Results</h2>
</section>

<section
	class="text-ligh bg-black/95 mt-20 pb-32 pt-24 text-center"
	style:color="var(--light-gold)"
>
	<div class="mx-auto max-w-prose">
		<h3 class="my-0 text-5xl font-black" style:color="var(--light-gold)">Top videos</h3>
		<p class="mt-8 mb-10 font-light tracking-wider">
			Here are the top 5 videos of the SoMEπ edition. <br />

			The full list of videos is available
			<a class="font-light" style:color="var(--light-gold)" href="/results/video">here</a>
		</p>
	</div>
	<div class="mx-4">
		<Carousel entries={data.videos}></Carousel>
	</div>
</section>
<section class="text-ligh bg-black/95 pb-24 pt-0 text-center" style:color="var(--light-gold)">
	<div class="mx-auto max-w-prose">
		<h3 class="my-0 text-5xl font-black" style:color="var(--light-gold)">Top non-videos</h3>
		<p class="mt-8 mb-10 font-light tracking-wider">
			Here are the top 5 non-video entries of the SoMEπ edition. <br />

			The full list of non-video entries is available
			<a class="font-light" style:color="var(--light-gold)" href="/results/non-video">here</a>
		</p>
	</div>
	<div class="mx-4">
		<Carousel entries={data.non_videos}></Carousel>
	</div>
</section>
<section>
	<div class="text-center">
		<h2 class="mb-10 text-4xl font-black">All entries</h2>

		<p>You can find the whole list of entries here:</p>
		<div>
			<a href="/results/video"><button class="btn btn-primary">All videos</button></a>
			<a href="/results/non-video"><button class="btn btn-primary">All non-videos</button></a>
		</div>
	</div>
</section>
