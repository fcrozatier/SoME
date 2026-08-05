<script lang="ts">
	import { enhance } from "$app/forms";
	import { clickOutside, disableSubmitterAndSetValidity } from "$lib/actions";
	import Time from "$lib/components/Time.svelte";
	import { newToast } from "$lib/components/Toasts.svelte";
	import { ENTRY_STATE } from "$lib/constants.js";
	import { parseAndSanitizeMarkdown } from "$lib/utils/markdown.js";
	import { formatRelativeTime } from "$lib/utils/time.js";

	let { data } = $props();

	let requireActionDialog: HTMLDialogElement | undefined = $state();
	const selected = $state({ entry_uid: "", title: "" });

	let note = $derived(
		`Your entry _"${selected.title}"_ is still flagged because (reason). Please update it by (action). When you're ready to ask for a review by admins, click the "Ask for review" button.`,
	);

	function closeDialog() {
		requireActionDialog?.close();
		selected.entry_uid = "";
		selected.title = "";
	}
</script>

<article class="mx-auto w-4/5 max-w-5xl">
	<h2>Open Issues (strikes)</h2>

	<div class="overflow-x-auto">
		<table class="w-full">
			<thead>
				<tr class="px-6">
					<th>Entry</th>
					<th>Striked</th>
					<th>Updated</th>
					<th>Deleted</th>
					<th>Reason</th>
					<th>State</th>
					<th>Action</th>
				</tr>
			</thead>
			<tbody>
				{#each data.strikes as { title, url, uid, state, reason, created_at, updated_at, deleted_at, note }}
					<tr class="px-6 py-2 border-b-0">
						<td>
							<div>
								<a class="capitalize" href={url} target="_blank">{title}</a>
								<br /><span class="text-nowrap">{uid}</span>
							</div>
						</td>
						<td class="text-nowrap">{formatRelativeTime(created_at)}</td>
						<td class="text-nowrap">{formatRelativeTime(updated_at) ?? "-"}</td>
						<td class="text-nowrap">
							{#if deleted_at}
								<Time datetime={deleted_at} includeTime={false}></Time>
							{:else}
								-
							{/if}
						</td>
						<td>{reason}</td>
						<td class="flex items-baseline gap-1.5 text-nowrap">
							<span
								class="w-1.5 inline-block aspect-square rounded-full"
								class:bg-yellow-500={state === ENTRY_STATE.ActionRequired}
								class:bg-green-500={state === ENTRY_STATE.WaitingForReview}
							></span>
							{state === ENTRY_STATE.ActionRequired ? "waiting for user action" : "ready fo review"}
						</td>
						<td>
							<form
								method="post"
								use:enhance={disableSubmitterAndSetValidity({
									after: async ({ result, action, update }) => {
										await update({ invalidateAll: true });
										if (result.type === "success") {
											const content =
												action.search === "?/remove_strike"
													? "Strike removed"
													: "Entry deactivated";
											newToast({ type: "info", content });
										}
									},
								})}
							>
								<input type="hidden" name="entry_uid" value={uid} />
								<div class="flex gap-4">
									<button type="submit" formaction="?/remove_strike" class="btn btn-outline btn-sm"
										>Remove Strike</button
									>
									<button
										type="button"
										class="btn btn-outline btn-error btn-sm"
										commandfor="require-action"
										command="show-modal"
										onclick={() => {
											selected.title = title;
											selected.entry_uid = uid;
											requireActionDialog?.showModal();
										}}>Require Action</button
									>
									<button
										type="submit"
										formaction="?/deactivate_entry"
										class="btn btn-outline btn-error btn-sm">Deactivate Entry</button
									>
								</div>
							</form>
						</td>
					</tr>
					<tr>
						<td colspan="5">
							<div>
								<b>Note:</b>
								<p class="alert mt-0 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">{@html note}</p>
							</div>
						</td>
						<td></td>
						<td></td>
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
	</div>
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
		<h2 class="mt-0">Require Follow-up Action</h2>
		<p class="text-gray-700 mb-0">
			This will notify creators of <em>"{selected.title}"</em> that they didn't fix the entry correctly
			and that a follow-up action is required.
		</p>

		<input type="hidden" name="uid" value={selected.entry_uid} />

		<p>
			<label for="note" class="label text-sm">Message (to help creators take action):</label>
			<textarea id="note" name="note" class="textarea w-full" bind:value={note} required
				>{note}</textarea
			>
			<span class="text-sm">You can edit this note with markdown</span>
		</p>

		<div>
			<span class="text-sm font-semibold">Preview:</span>
			<div class="alert [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
				{@html await parseAndSanitizeMarkdown(note)}
			</div>
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
