<script lang="ts">
	import { PUBLIC_S3_BUCKET, PUBLIC_S3_ENDPOINT } from '$env/static/public';
	import { nonVideos } from '$lib/records';
</script>

<section class="pb-32">
	<div class="py-10 mx-auto max-w-prose">
		<h2 class="text-center">All non-video entries</h2>
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
		{#each nonVideos as entry}
			<div class="flex flex-col gap-3">
				<div class="">
					<a href={entry.link} target="_blank" class="w-80">
						<img
							class="aspect-video rounded-lg max-w-full m-0"
							src={`https://${PUBLIC_S3_BUCKET}.${PUBLIC_S3_ENDPOINT.replace('https://', '')}/${
								entry.thumbnail
							}`}
							alt="no thumbnail provided"
							width="320"
							loading="lazy"
						/>
					</a>
				</div>
				<div class="px-2">
					<h4 class="mt-0 capitalize">{entry.title}</h4>
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	.custom-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 250px));
		justify-content: center;
		gap: theme(space.12) theme(space.16);
	}
</style>
