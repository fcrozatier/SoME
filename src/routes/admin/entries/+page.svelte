<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { clickOutside } from '$lib/actions';
	import Display from '$lib/components/Display.svelte';

	export let data;
	export let form;

	let displayDialog: HTMLDialogElement;
</script>

<article class="mx-auto w-4/5 max-w-5xl">
	<h2>Entries to review</h2>

	<table class="w-full">
		<thead>
			<tr class="px-6">
				<th class="text-left">Entry</th>
				<th class="text-left">Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each data.entries as entry (entry.uid)}
				<tr class="px-6 py-2">
					<td class="capitalize">{entry.title}</td>
					<td class="inline-flex gap-2">
						<form
							method="POST"
							use:enhance={() => {
								const buttons = document.querySelectorAll('button');
								buttons.forEach((b) => b.setAttribute('disabled', 'on'));

								return async ({ result, action }) => {
									await applyAction(result);
									buttons.forEach((b) => b.removeAttribute('disabled'));

									if (result.type === 'success' && action.search.includes('display')) {
										displayDialog.show();
									}
								};
							}}
						>
							<input type="hidden" name="uid" value={entry.uid} />
							<button formaction="?/display" class="btn btn-primary btn-sm">Display</button>
						</form>
						<a class="btn btn-sm" href={`/update/${entry.uid}`}>Update</a>
					</td>
				</tr>
			{:else}
				<p class="px-6">No entries to review</p>
			{/each}
		</tbody>
	</table>
</article>

<dialog class="fixed inset-0 pt-0 m-auto overflow-auto" bind:this={displayDialog}>
	<article class="" use:clickOutside={() => displayDialog.close()}>
		{#if form?.entry}
			<Display data={form.entry}></Display>

			<p class="flex gap-2">
				<button class="btn btn-outline" on:click={() => displayDialog.close()}>Close</button>
				<a class="btn btn-outline" href={`/update/${form.entry.uid}`}>Update</a>
			</p>
		{/if}
	</article>
</dialog>

<style>
	tr {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 1rem;
		align-items: start;
	}
	tr:nth-child(even) {
		background-color: rgb(242, 242, 242);
	}
</style>
