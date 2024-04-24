<script lang="ts">
	import { COMPETITION_FULL_NAME, COMPETITION_SHORT_NAME } from '$lib/config';
	import Icon from '$lib/components/Icon.svelte';
	import { winners, honorables } from '$lib/results';
</script>

<svelte:head>
	<title>{COMPETITION_SHORT_NAME}</title>
</svelte:head>

<section class="layout-prose pb-10">
	<p class=" mb-16 text-center text-3xl font-light">Discover and create new math content.</p>
	<p>
		The {COMPETITION_FULL_NAME} ({COMPETITION_SHORT_NAME}) is an annual competition to foster the
		creation of excellent math content online. You can find the SoME3 winners below. The full list
		of non video entries is available <a href="/non-videos">here</a>. The playlist of all video
		entries is available
		<a
			href="https://www.youtube.com/playlist?list=PLnQX-jgAF5pQS2GUFCsatSyZkSH7e8UM8"
			target="_blank">here</a
		>
	</p>
</section>

<section class="pb-28">
	<h2 class="mb-20 text-5xl font-black text-center">The 5 winners are</h2>

	<div class="grid gap-20">
		{#each winners as winner}
			<div class="flex flex-wrap items-start justify-center gap-6 lg:gap-8">
				<div class="px-4">
					{#if winner.video}
						<iframe
							width="420"
							class="aspect-video rounded-lg max-w-full"
							src={winner.link}
							title="YouTube video player"
							frameborder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
							allowfullscreen
							loading="lazy"
						/>
					{:else}
						<a href={winner.link} target="_blank" class="w-[420px]">
							<img
								src={winner.thumbnail}
								alt="Winner thumbnail"
								width="420"
								class="aspect-video rounded-lg max-w-full m-0"
								loading="lazy"
							/>
						</a>
					{/if}
				</div>
				<div class="max-w-sm mx-4">
					<h3 class="mt-2 mb-3">{winner.title}</h3>
					<p class="line-clamp-6 leading-snug">{winner.description}</p>
				</div>
			</div>
		{/each}
	</div>
</section>

<section class="text-ligh bg-black/95 pb-32 pt-24 text-center" style:color="var(--light-gold)">
	<div class="mx-auto max-w-prose">
		<h2 class="mt-0 text-5xl font-black" style:color="var(--light-gold)">
			The 20 honorable mentions
		</h2>
		<!-- <p class="mt-8 mb-12 font-light tracking-wider">
			Discover the 5 winners of the last edition. <br />

			The 20 honorable mentions as well as the full list of entries is available
			<a
				class="font-light"
				style:color="var(--light-gold)"
				href="https://www.3blue1brown.com/blog/some2">here</a
			>
		</p> -->
	</div>
	<div class="custom-grid px-4">
		{#each honorables as honorable}
			<div class="flex flex-col gap-3">
				<div class="">
					{#if honorable.video}
						<iframe
							width="360"
							class="aspect-video rounded-lg max-w-full"
							src={honorable.link}
							title="YouTube video player"
							frameborder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
							allowfullscreen
							loading="lazy"
						/>
					{:else}
						<a href={honorable.link} target="_blank" class="w-[420px]">
							<img
								src={honorable.thumbnail}
								alt="Winner thumbnail"
								width="360"
								class="aspect-video rounded-lg max-w-full m-0"
								loading="lazy"
							/>
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

		<p>You can find the whole list of entries here:</p>
		<div>
			<a
				href="https://www.youtube.com/playlist?list=PLnQX-jgAF5pQS2GUFCsatSyZkSH7e8UM8"
				target="_blank"><button class="btn btn-neutral">All videos</button></a
			>
			<a href="/non-videos"><button class="btn btn-neutral">All non-videos</button></a>
		</div>
	</div>
</section>

<section class="mt-10 pt-10">
	<h2 class="text-center text-2xl font-light">
		Prizes and operations for this contest have been generously funded by
	</h2>
	<div class="flex justify-center">
		<a href="https://www.janestreet.com/" target="_blank">
			<Icon class="opacity-10" name="janeStreet" width="18rem" height="5rem" />
		</a>
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
