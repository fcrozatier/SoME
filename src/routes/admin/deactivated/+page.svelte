<script lang="ts">
	import { enhance } from "$app/forms";
	import { toggleSelectAll } from "$lib/actions";
	import { newToast } from "$lib/components/Toasts.svelte";

	let { data } = $props();

	let selected: string[] = $state([]);
</script>

<article class="mx-auto w-4/5 max-w-5xl overflow-x-auto">
	<h2>Deactivated entries</h2>

	<table class="w-full">
		<thead>
			<tr class="px-6">
				<th class="flex items-center">
					<input id="all" type="checkbox" class="checkbox" use:toggleSelectAll />
				</th>
				<th class="text-left">Entry</th>
				<th class="text-left">Id</th>
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
					<td><a class="capitalize" href={entry.url} target="_blank">{entry.title}</a></td>
					<td><span class="font-mono">{entry.uid}</span></td>
					<td><span class="">{entry.reason}</span></td>
				</tr>
			{:else}
				<tr>
					<td> No entries to review </td>
				</tr>
			{/each}
		</tbody>
	</table>
	<form
		method="post"
		use:enhance={() => {
			const buttons = document.querySelectorAll("button");
			buttons.forEach((b) => b.setAttribute("disabled", "on"));

			return async ({ update, result }) => {
				buttons.forEach((b) => b.removeAttribute("disabled"));
				if (result.type === "success") {
					newToast({ type: "info", content: "Entry reactivated!" });
				}
				await update();
			};
		}}
	>
		{#each selected as uid}
			<input type="hidden" name="selected" value={uid} />
		{/each}

		<button formaction="?/reactivate" class="btn" disabled={!selected.length}>Reactivate</button>
	</form>
</article>

<style>
	tr {
		display: grid;
		grid-template-columns: auto 1fr 320px 1fr;
		gap: 1rem;
		align-items: start;
	}

	tr:nth-child(even) {
		background-color: rgb(242, 242, 242);
	}
</style>
