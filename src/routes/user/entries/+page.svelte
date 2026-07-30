<script lang="ts">
	import { enhance } from "$app/forms";
	import { PUBLIC_REGISTRATION_END, PUBLIC_REGISTRATION_START } from "$env/static/public";
	import { disableSubmitterAndSetValidity } from "$lib/actions";
	import LayoutSideBySide from "$lib/components/layouts/LayoutSideBySide.svelte";
	import Media from "$lib/components/Media.svelte";
	import Time from "$lib/components/Time.svelte";
	import { ENTRY_STATE } from "$lib/constants";
	import { submissionsOpen } from "$lib/utils/time.js";

	const { data } = $props();

	const entriesByYear = $derived(
		Object.groupBy(data.userEntries, (x) => new Date(x.createdAt).getFullYear()),
	);
</script>

<article class="layout-prose">
	<h2>My entries</h2>

	{#if data.strike}
		<div class="alert alert-warning">
			{#if data.strike.state === ENTRY_STATE.ActionRequired}
				{data.strike.note}
			{:else if data.strike.state === ENTRY_STATE.WaitingForReview}
				Your entry "{data.strike.title}" is being reviewed by admins...
			{/if}
		</div>
	{/if}

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

<section class="layout-prose mt-10">
	{#if data.userEntries.length > 0}
		{#each Object.entries(entriesByYear).sort(([y1], [y2]) => Number(y2) - Number(y1)) as [year, entries]}
			<h3>{year}</h3>
			<div class="max-w-3xl mx-auto">
				{#each entries! as { uid, title, description, category, thumbnail, url, createdAt }}
					<div>
						<LayoutSideBySide side="right" mainPanelMinWidth="83%" sidePanelMaxWidth="64px">
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
								<div class="flex items-center text-xs flex-wrap gap-2">
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
									{#if data.strike?.entry_uid === uid}
										<form
											method="post"
											action="?/ask_review"
											use:enhance={disableSubmitterAndSetValidity({
												toast: {
													success: { type: "info", content: "Admins notified" },
												},
											})}
										>
											<button class="btn btn-sm font-medium text-nowrap">Ask for review</button>
										</form>
									{/if}
								</div>
							{/snippet}
						</LayoutSideBySide>
					</div>
					<hr class="my-8!" />
				{/each}
			</div>
		{/each}
	{:else}
		<div>
			<p>No entries submitted</p>
		</div>
	{/if}
</section>
