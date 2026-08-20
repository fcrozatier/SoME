<script lang="ts">
	import { enhance } from "$app/forms";
	import { PUBLIC_REGISTRATION_END, PUBLIC_REGISTRATION_START } from "$env/static/public";
	import { clickOutside } from "$lib/actions";
	import LayoutSideBySide from "$lib/components/layouts/LayoutSideBySide.svelte";
	import Media from "$lib/components/Media.svelte";
	import Time from "$lib/components/Time.svelte";
	import { newToast } from "$lib/components/Toasts.svelte";
	import { ENTRY_STATE } from "$lib/constants";
	import { submissionsOpen } from "$lib/utils/time.js";

	const { data } = $props();

	const entriesByYear = $derived(
		Object.groupBy(data.userEntries, (x) => new Date(x.createdAt).getFullYear()),
	);

	let askReviewDialog: HTMLDialogElement | undefined = $state();
	let askReviewUid: string | undefined = $state();
</script>

<article class="layout-prose">
	<h2>My entries</h2>

	{#if data.strike?.state === ENTRY_STATE.ActionRequired}
		<div class="alert alert-warning text-pretty [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
			{@html data.strike.note}

			<button
				type="button"
				class="btn btn-sm font-medium text-nowrap"
				commandfor="ask-review-dialog"
				command="show-modal"
				onclick={() => {
					askReviewUid = data.strike?.entry_uid;
					askReviewDialog?.showModal();
				}}>Ask for review</button
			>
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
				{#each entries! as { uid, title, description, category, thumbnail, url, state, createdAt }}
					<div>
						<LayoutSideBySide side="right" mainPanelMinWidth="85%" sidePanelMaxWidth="64px">
							{#snippet mainPanel()}
								<Media
									{uid}
									{category}
									{title}
									{description}
									{url}
									{thumbnail}
									thumbnailWidth="270px"
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
									{#if (new Date(createdAt) > new Date(PUBLIC_REGISTRATION_START) && new Date(createdAt) < new Date(PUBLIC_REGISTRATION_END)) || (data.strike?.entry_uid === uid && data.strike?.state === ENTRY_STATE.ActionRequired)}
										<a class="btn btn-sm" href={`/user/entries/update/${uid}`}> update </a>
									{/if}
									{#if data.strike?.entry_uid === uid && data.strike?.state === ENTRY_STATE.WaitingForReview}
										<span>under review</span>
									{:else if state === ENTRY_STATE.Inactive && data.strike !== undefined}
										<span>inactive</span>
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

<dialog id={`ask-review-dialog`} class="m-auto" bind:this={askReviewDialog} closedby="any">
	<form
		method="post"
		class="space-y-2"
		action="?/ask_review"
		use:clickOutside={() => askReviewDialog?.close()}
		use:enhance={() => {
			const buttons = document.querySelectorAll("button");
			buttons.forEach((b) => b.setAttribute("disabled", "on"));

			return async ({ result, update }) => {
				await update({ invalidateAll: true });
				buttons.forEach((b) => b.removeAttribute("disabled"));

				if (result.type === "success") {
					askReviewDialog?.close();
					newToast({
						type: "info",
						content: "Your entry will be reviewed by admins",
					});
				} else if (
					result.type === "failure" &&
					result.data?.issues !== null &&
					typeof result.data?.issues === "object"
				) {
					const message = Object.values(result.data.issues)?.[0]?.message ?? "";
					if (message) {
						newToast({ type: "error", content: message });
					}
				}
			};
		}}
	>
		<h2 class="mt-0">Are you sure?</h2>
		<p class="text-gray-700 mb-0">
			You're about to ask admins to review your entry. <br />
			<b>Make sure you made all the mandatory updates before</b>
		</p>

		<input type="hidden" name="uid" value={askReviewUid} />

		<p class="mb-0 mt-8 flex items-center justify-end gap-2">
			<button
				type="button"
				class="btn-outline btn"
				commandfor="flag"
				command="request-close"
				onclick={() => askReviewDialog?.close()}>Cancel</button
			>
			<button type="submit" class="btn-primary btn">Ask for review</button>
		</p>
	</form>
</dialog>
