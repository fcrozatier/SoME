<script lang="ts">
	import { enhance } from "$app/forms";
	import { disableSubmitterAndSetValidity, toggleSelectAll } from "$lib/actions";
	import { newToast } from "$lib/components/Toasts.svelte";

	let { data } = $props();

	let selected: string[] = $state([]);
</script>

<article class="mx-auto w-4/5 max-w-5xl overflow-x-auto">
	<h2>Reported entries</h2>

	<table class="w-full">
		<thead>
			<tr class="px-6">
				<th class="flex items-center"
					><input id="all" type="checkbox" class="checkbox" use:toggleSelectAll /></th
				>
				<th class="text-left">Entry</th>
				<th class="text-left">Reason</th>
			</tr>
		</thead>
		<tbody>
			{#each data.flagged as entry}
				<tr class="px-6 py-2">
					<td class="flex items-center"
						><input
							type="checkbox"
							class="checkbox"
							name="selected"
							value={entry.uid}
							bind:group={selected}
						/></td
					>
					<td
						><a class="capitalize" href={entry.url} target="_blank">{entry.title}</a>
						<br />{entry.uid}</td
					>
					<td><span class="">{entry.reason}</span></td>
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
	<form
		method="post"
		use:enhance={disableSubmitterAndSetValidity({
			after: ({ result, action }) => {
				if (result.type === "success") {
					const content = action.search === "?/ignore" ? "Ignored" : "Deactivated";
					newToast({ type: "info", content });
				}
			},
		})}
	>
		{#each selected as uid}
			<input type="hidden" name="selected" value={uid} />
		{/each}

		<div class="flex gap-4">
			<button type="submit" formaction="?/ignore" class="btn" disabled={!selected.length}
				>Ignore</button
			>
			<button
				type="submit"
				formaction="?/deactivate"
				class="btn-error btn"
				disabled={!selected.length}>Deactivate</button
			>
		</div>
		<p class="text-sm">
			Deactivation is not destructive: the creator(s) will still have access to the feedbacks, but
			the entry will not receive any new votes
		</p>
	</form>
</article>

<style>
	tr {
		display: grid;
		grid-template-columns: auto 1fr 1fr;
		gap: 1rem;
		align-items: start;
	}

	tr:nth-child(even) {
		background-color: rgb(242, 242, 242);
	}
</style>
