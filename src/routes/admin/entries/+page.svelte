<script lang="ts">
	import { applyAction, enhance } from "$app/forms";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { clickOutside } from "$lib/actions";
	import Display from "$lib/components/Display.svelte";
	import Pagination from "$lib/components/Pagination.svelte";

	let { data, form = $bindable() } = $props();

	let pageNumber = $state(Number(page.url.searchParams.get("page") ?? "1"));
	let displayDialog: HTMLDialogElement | undefined = $state();
</script>

<article class="mx-auto w-4/5 max-w-5xl">
	<h2>Entries to review</h2>

	<div class="mt-10 mx-auto flex justify-center">
		<Pagination
			pages={data.pages}
			bind:pageNumber
			onchange={() => {
				page.url.searchParams.set("page", `${pageNumber}`);
				goto(`?${page.url.searchParams.toString()}`, {
					invalidateAll: true,
					keepFocus: true,
					noScroll: true,
				});
			}}
		></Pagination>
	</div>

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
								const buttons = document.querySelectorAll("button");
								buttons.forEach((b) => b.setAttribute("disabled", "on"));

								return async ({ result, action }) => {
									await applyAction(result);
									buttons.forEach((b) => b.removeAttribute("disabled"));

									if (result.type === "success" && action.search.includes("display")) {
										displayDialog?.show();
										displayDialog?.scrollTo({ top: 0 });
									}
								};
							}}
						>
							<input type="hidden" name="uid" value={entry.uid} />
							<button formaction="?/display" class="btn btn-neutral btn-sm">Display</button>
						</form>
						<a class="btn btn-sm" href={`/admin/update/${entry.uid}`}>Update</a>
					</td>
				</tr>
			{:else}
				<tr>
					<td>
						<p class="px-6">No entries to review</p>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<div class="mt-10 mx-auto flex justify-center">
		<Pagination
			pages={data.pages}
			bind:pageNumber
			onchange={() => {
				page.url.searchParams.set("page", `${pageNumber}`);
				goto(`?${page.url.searchParams.toString()}`, {
					invalidateAll: true,
					keepFocus: true,
					noScroll: true,
				});
			}}
		></Pagination>
	</div>
</article>

<dialog
	class="fixed inset-0 pt-0 m-auto overflow-auto"
	bind:this={displayDialog}
	closedby="any"
	onclose={() => {
		// Stop playing
		form = null;
	}}
>
	<article class="" use:clickOutside={() => displayDialog?.close()}>
		{#if form?.entry}
			<Display data={form.entry}></Display>

			<p class="flex gap-2">
				<button class="btn btn-outline hover:btn-neutral" onclick={() => displayDialog?.close()}>Close</button>
				<a class="btn btn-outline hover:btn-neutral" href={`/admin/update/${form.entry.uid}`}>Update</a>
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
