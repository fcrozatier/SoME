<script lang="ts">
	import { PUBLIC_REGISTRATION_END, PUBLIC_REGISTRATION_START } from "$env/static/public";
	import LayoutSideBySide from "$lib/components/layouts/LayoutSideBySide.svelte";
	import Media from "$lib/components/Media.svelte";
	import Time from "$lib/components/Time.svelte";
	import { submissionsOpen } from "$lib/utils/time.js";

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
		<a
			href="/user/entries/new"
			class={`btn btn-neutral ${!submissionsOpen() ? "btn-disabled pointer-events-none" : ""}`}
			>New entry</a
		>
	</p>
</article>

{#if data.userEntries.length > 0}
	<div class="px-4 mt-10">
		<div class="max-w-3xl mx-auto">
			<hr class="my-8!" />
			{#each data.userEntries as { uid, title, description, category, thumbnail, url, createdAt }}
				<div class="entry">
					<LayoutSideBySide side="right" contentMinSize="85%" sideWidth="64px">
						{#snippet mainPanel()}
							<Media
								{uid}
								{category}
								{title}
								{description}
								{url}
								{thumbnail}
								thumbnailWidth="256px"
								gap={6}
							></Media>
						{/snippet}
						{#snippet sidePanel()}
							<div class="flex items-center text-xs flex-wrap gap-4">
								<span class="text-center text-trim">
									<Time
										datetime={createdAt}
										options={{
											month: "2-digit",
											day: "2-digit",
											year: "numeric",
										}}
									/>
								</span>
								<a class="btn btn-sm ml-auto sm:ml-0" href={`/entries/${uid}`}> details </a>
								{#if new Date(createdAt) > new Date(PUBLIC_REGISTRATION_START) && new Date(createdAt) < new Date(PUBLIC_REGISTRATION_END)}
									<a class="btn btn-sm" href={`/user/entries/update/${uid}`}> update </a>
								{/if}
							</div>
						{/snippet}
					</LayoutSideBySide>
					<hr class="my-8!" />
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div class="layout-prose">
		<p>No entry submitted</p>
	</div>
{/if}
