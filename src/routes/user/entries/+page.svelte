<script lang="ts">
	import { PUBLIC_REGISTRATION_END, PUBLIC_REGISTRATION_START } from "$env/static/public";
	import Thumbnail from "$lib/components/Thumbnail.svelte";
	import Time from "$lib/components/Time.svelte";
	import Youtube from "$lib/components/Youtube.svelte";
	import { submissionsOpen, YOUTUBE_EMBED } from "$lib/utils";

	const { data } = $props();
</script>

<article class="layout-prose">
	<h2>My entries</h2>

	<p>
		{#if new Date() < new Date(PUBLIC_REGISTRATION_START)}
			Submissions open on <strong><Time datetime={PUBLIC_REGISTRATION_START} /></strong>.
		{:else if new Date() < new Date(PUBLIC_REGISTRATION_END)}
			The submission deadline is <strong><Time datetime={PUBLIC_REGISTRATION_END} /></strong>.
		{:else}
			Submissions are closed
		{/if}
	</p>
	<p>
		<button class="btn btn-neutral" disabled={!submissionsOpen()}>New entry</button>
	</p>

	{#if data.userEntries.length > 0}
		<div class="overflow-x-scroll sm:px-4">
			<table class="table min-w-xl max-w-3xl mx-auto">
				<thead>
					<tr>
						<th>Entry</th>
						<th>Title</th>
						<th class="text-center">Rank</th>
					</tr>
				</thead>
				<tbody>
					{#each data.userEntries as { uid, title, description, category, thumbnail, url }}
						<tr>
							<td>
								{#if category === "video" && url && YOUTUBE_EMBED.test(url)}
									{#key url}
										<Youtube src={url} {title}></Youtube>
									{/key}
								{:else if thumbnail && url && !YOUTUBE_EMBED.test(url)}
									<a href={url} target="_blank">
										<Thumbnail uid={thumbnail} width={256}></Thumbnail>
									</a>
								{:else}
									<a href={url} class="line-clamp-1" target="_blank">{url}</a>
								{/if}
							</td>
							<td>
								<h3 class="text-base text-balance line-clamp-2 text-trim mt-0">{title}</h3>
								{#if description}
									<p class="line-clamp-3">{description}</p>
								{/if}
							</td>
							<td class="items-center flex flex-col gap-4">
								<a class="btn btn-sm" href={`/entries/${uid}`}> details </a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<p>No entry submitted</p>
	{/if}
</article>
