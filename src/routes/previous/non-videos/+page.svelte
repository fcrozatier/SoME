<script lang="ts">
	import { PUBLIC_S3_BUCKET, PUBLIC_S3_ENDPOINT } from "$env/static/public";
	import { nonVideos } from "$lib/records";
</script>

<section class="pb-32">
	<div class="py-10 mx-auto max-w-prose">
		<h2 class="text-center">All SoME3 non-video entries</h2>
	</div>
	<div class="custom-grid px-4">
		{#each nonVideos as entry}
			<div class="flex flex-col gap-3">
				<div class="">
					<a href={entry.link} target="_blank" class="w-80">
						<img
							class="aspect-video rounded-lg max-w-full m-0"
							src={`https://${PUBLIC_S3_BUCKET}.${PUBLIC_S3_ENDPOINT.replace("https://", "")}/${
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
		gap: var(--spacing-12) var(--spacing-16);
	}
</style>
