<script lang="ts">
	import { enhance } from "$app/forms";
	import { clickOutside, disableSubmitterAndSetValidity } from "$lib/actions";
	import { newToast } from "$lib/components/Toasts.svelte";
	import { parseAndSanitizeMarkdown } from "$lib/utils/markdown.js";

	let { data } = $props();

	let requireActionDialog: HTMLDialogElement | undefined = $state();

	const selectedEntry = $state({ uid: "", title: "" });
	let selectedReason: keyof typeof reasons | undefined | null = $state();
	let note = $derived(selectedReason ? createNote(selectedEntry.title, selectedReason) : "");

	const reasons = {
		ai: "it doesn't respect the [AI Policy](/ai-policy)",
		visibility: "it is not publicly accessible",
		duplicate: "multiple entries are not allowed",
		inappropriate: "it contains inappropriate content",
		scope: "it is out of scope (not math related)",
		inaccurate: "it contains inaccurate math statements",
		other: "(custom reason)",
	};

	function createNote(title: string, reason: keyof typeof reasons) {
		switch (reason) {
			case "duplicate":
				return `Your entry _"${title}"_ was flagged for the following reason: ${reasons[reason]}. It has been temporarily removed from the competition. You should remove duplicate entries to only keep a single one. When you're ready to ask for a review by admins, click the "Ask for review" button.`;

			case "visibility":
				return `Your entry _"${title}"_ was flagged for the following reason: ${reasons[reason]}. It has been temporarily removed from the competition. Please update your entry so that it is publicly accessible. When you're ready to ask for a review by admins, click the "Ask for review" button.`;

			default:
				return `Your entry _"${title}"_ was flagged for the following reason: ${reasons[reason]}. It has been temporarily removed from the competition. You can update your entry, and when you're ready to ask for a review by admins, click the "Ask for review" button.`;
		}
	}

	function closeDialog() {
		requireActionDialog?.close();
		selectedReason = null;
		selectedEntry.title = "";
		selectedEntry.uid = "";
	}
</script>

<article class="mx-auto w-4/5 max-w-5xl overflow-x-auto">
	<h2>Flagged entries</h2>

	<table class="w-full">
		<thead>
			<tr class="px-6">
				<th class="text-left">Entry</th>
			</tr>
		</thead>
		<tbody>
			{#each Object.entries(data.flagged) as [entryUid, flags]}
				{@const url = flags?.at(0)?.url ?? ""}
				{@const title = flags?.at(0)?.title ?? ""}

				<tr class="px-6 py-2">
					<td>
						<div class="flex items-center justify-between">
							<div>
								<a class="capitalize" href={url} target="_blank">{title}</a>
								<br />{entryUid}
							</div>
							<div>
								<form
									method="post"
									use:enhance={disableSubmitterAndSetValidity({
										after: async ({ result, action, update }) => {
											await update({ invalidateAll: true });

											if (result.type === "success") {
												const content =
													action.search === "?/ignore" ? "Ignored" : "Creators notified";
												newToast({ type: "info", content });
											}
										},
									})}
								>
									<input type="hidden" name="uid" value={entryUid} />

									<div class="flex gap-4">
										<button type="submit" formaction="?/ignore_flags" class="btn btn-sm"
											>Ignore flags</button
										>
										<button
											type="button"
											class="btn btn-outline btn-error btn-sm"
											commandfor="require-action"
											command="show-modal"
											onclick={() => {
												selectedEntry.title = title;
												selectedEntry.uid = entryUid;
												requireActionDialog?.showModal();
											}}>Require Action</button
										>
									</div>
								</form>
							</div>
						</div>
						<div>
							<ul>
								{#each flags as flag}
									<li class="">{flag.reason}</li>
								{/each}
							</ul>
						</div>
					</td>
				</tr>
			{:else}
				<tr>
					<td>
						<p>No entries to review</p>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</article>

<dialog id="require-action" class="m-auto" bind:this={requireActionDialog} closedby="any">
	<form
		method="post"
		class="space-y-2"
		action="?/action_required"
		use:clickOutside={closeDialog}
		use:enhance={() => {
			const buttons = document.querySelectorAll("button");
			buttons.forEach((b) => b.setAttribute("disabled", "on"));

			return async ({ result, update }) => {
				await update({ invalidateAll: true });
				buttons.forEach((b) => b.removeAttribute("disabled"));

				if (result.type === "success") {
					closeDialog();
					newToast({ type: "info", content: "Creators notified" });
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
		<h2 class="mt-0">Require User Action</h2>
		<p class="text-gray-700 mb-0">
			This will notify creators of <em>{selectedEntry.title}</em> that their entry was flagged and must
			be updated.
		</p>

		<p>
			<label for="reason" class="label text-sm block">Reason</label>
			<select class="select" name="reason" bind:value={selectedReason} required>
				{#each Object.keys(reasons) as value}
					<option {value}>{value}</option>
				{/each}
			</select>
		</p>

		<input type="hidden" name="uid" value={selectedEntry.uid} />

		<div>
			<label for="note" class="label text-sm">Note to creators (to help them take action):</label>
			<textarea id="note" name="note" class="textarea w-full" bind:value={note} required
				>{note}</textarea
			>
			<span class="text-sm">You can edit this note with markdown</span>
		</div>

		<div>
			{#if note}
				<span class="text-sm font-semibold">Preview:</span>
				<div class="alert [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
					{@html await parseAndSanitizeMarkdown(note)}
				</div>
			{/if}
		</div>

		<p class="mb-0 mt-8 flex items-center justify-end gap-2">
			<button
				type="button"
				class="btn-outline btn"
				commandfor="flag"
				command="request-close"
				onclick={() => requireActionDialog?.close()}>Cancel</button
			>
			<button type="submit" class="btn-outline btn-error btn">Notify</button>
		</p>
	</form>
</dialog>

<style>
	tr {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
		align-items: start;
	}

	tr:nth-child(even) {
		background-color: rgb(242, 242, 242);
	}
</style>
