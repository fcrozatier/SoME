<script lang="ts">
	import { enhance } from "$app/forms";
	import { disableSubmitterAndSetValidity } from "$lib/actions";
	import Time from "$lib/components/Time.svelte";
	import { newToast } from "$lib/components/Toasts.svelte";
	import { ENTRY_STATE } from "$lib/constants.js";
	import { relativeTime } from "$lib/utils/time.js";

	let { data } = $props();
</script>

<article class="mx-auto w-4/5 max-w-5xl">
	<h2>Strikes</h2>

	<div class="overflow-x-auto">
		<table class="w-full">
			<thead>
				<tr class="px-6">
					<th class="">Entry</th>
					<th class="">Striked</th>
					<th class="">Updated</th>
					<th class="">Deleted</th>
					<th class="">Reason</th>
					<th class="">State</th>
					<th class="">Action</th>
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
						<td class="text-nowrap">{relativeTime(created_at)}</td>
						<td class="text-nowrap">{relativeTime(updated_at) ?? "-"}</td>
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
