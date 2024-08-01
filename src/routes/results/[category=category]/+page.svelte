<script lang="ts">
	import { goto, preloadData, pushState } from '$app/navigation';
	import { page } from '$app/stores';
	import { clickOutside } from '$lib/actions.js';
	import type { ComponentProps } from 'svelte';
	import EntriesPage from '../../entries/[uid=uuid]/+page.svelte';

	export let data;

	let displayDialog: HTMLDialogElement;
	let entry: ComponentProps<EntriesPage>['data'] | undefined;
</script>

<article class="layout-prose">
	<h2>Ranking of the {$page.params.category} entries</h2>

	<table class="table w-full">
		<thead>
			<tr>
				<th>Title</th>
				<th>Rank</th>
			</tr>
		</thead>
		<tbody>
			{#each data.entries as { uid, title, rank }}
				<tr>
					<td
						><a
							href={`/entries/${uid}`}
							on:click={async (e) => {
								if (window.innerWidth < 640 || e.shiftKey || e.metaKey || e.ctrlKey) {
									return;
								}

								e.preventDefault();

								const { href } = e.currentTarget;
								const result = await preloadData(href);

								if (result.type === 'loaded' && result.status === 200) {
									pushState(href, { entry: result.data });
									// @ts-ignore
									entry = result.data;
									displayDialog.showModal();
								} else {
									goto(href);
								}
							}}>{title}</a
						></td
					>
					<td>{rank}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</article>

{#if entry}
	<dialog
		class="fixed inset-0 pt-0 m-auto overflow-auto max-w-3xl overscroll-y-none"
		bind:this={displayDialog}
		on:close={() => {
			history.back();
			entry = undefined;
		}}
		open
	>
		<article class="" use:clickOutside={() => displayDialog.close()}>
			<EntriesPage data={entry}></EntriesPage>
			<p class="flex gap-2 mt-12">
				<button class="btn btn-outline" on:click={() => displayDialog.close()}>Close</button>
			</p>
		</article>
	</dialog>
{/if}

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
