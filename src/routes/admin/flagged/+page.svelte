<script lang="ts">
	import { enhance } from "$app/forms";
	import { disableSubmitterAndSetValidity } from "$lib/actions";
	import { newToast } from "$lib/components/Toasts.svelte";

	let { data } = $props();
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
				{@const url = flags?.at(0)?.url}
				{@const title = flags?.at(0)?.title}

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
											type="submit"
											formaction="?/action_required"
											class="btn-error btn-outline btn btn-sm">Action required</button
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
