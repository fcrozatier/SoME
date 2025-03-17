<script lang="ts">
	import { goto, preloadData, pushState } from "$app/navigation";
	import { page } from "$app/state";
	import { clickOutside } from "$lib/actions.js";
	import Pagination from "$lib/components/Pagination.svelte";
	import Thumbnail from "$lib/components/Thumbnail.svelte";
	import Youtube from "$lib/components/Youtube.svelte";
	import { YOUTUBE_EMBED } from "$lib/utils";
	import type { ComponentProps } from "svelte";
	import EntriesPage from "../../entries/[uid=uuid]/+page.svelte";

	let { data } = $props();

	let displayDialog: HTMLDialogElement | undefined = $state();
	let entry: ComponentProps<typeof EntriesPage>["data"] | undefined = $state();
	let pageNumber: string = $state("1");

	async function loadData(
		e: MouseEvent & {
			currentTarget: EventTarget & HTMLAnchorElement;
		},
	) {
		if (window.innerWidth < 640 || e.shiftKey || e.metaKey || e.ctrlKey) {
			return;
		}

		e.preventDefault();

		const { href } = e.currentTarget;
		const result = await preloadData(href);

		if (result.type === "loaded" && result.status === 200) {
			pushState(href, { entry: result.data });
			// @ts-ignore
			entry = result.data;
			displayDialog?.showModal();
			displayDialog?.scrollTo({ top: 0 });
		} else {
			goto(href);
		}
	}
</script>

<svelte:head>
	<title>Ranking &middot; SoME</title>
</svelte:head>

<article class="layout-prose text-center">
	<h2>Ranking of the {page.params.category} entries</h2>
</article>

<div class="my-10 mx-auto flex justify-center">
	<Pagination
		pages={data.pages}
		bind:pageNumber
		onchange={() => {
			page.url.searchParams.set("page", pageNumber);
			goto(`?${page.url.searchParams.toString()}`, {
				invalidateAll: true,
				keepFocus: true,
				noScroll: true,
			});
		}}
	></Pagination>
</div>

<div class="overflow-x-scroll sm:px-4">
	<table class="table min-w-xl max-w-3xl mx-auto">
		<thead>
			<tr>
				<th>Entry</th>
				<th>Title</th>
				<th class="text-center">Rank</th>
			</tr>
		</thead>
		<tbody>
			{#each data.entries as { uid, title, description, category, thumbnail, url, rank }}
				<tr>
					<td>
						{#if category === "video" && url && YOUTUBE_EMBED.test(url)}
							{#key url}
								<Youtube src={url} {title}></Youtube>
							{/key}
						{:else if thumbnail && url && !YOUTUBE_EMBED.test(url)}
							<a href={url} target="_blank" class="w-[272px]">
								<Thumbnail uid={thumbnail} width={272}></Thumbnail>
							</a>
						{:else}
							<a href={url} target="_blank">{url} </a>
						{/if}
					</td>
					<td>
						<h3 class="text-base text-balance line-clamp-2 text-trim mt-0">{title}</h3>
						<p class="line-clamp-3">{description}</p>
					</td>
					<td class="items-center flex flex-col gap-4">
						<span class="text-trim">{rank ? `#${rank}` : "-"}</span>
						<a class="btn btn-sm" href={`/entries/${uid}`} onclick={loadData}> details </a>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<div class="mt-10 mx-auto flex justify-center">
	<Pagination
		pages={data.pages}
		bind:pageNumber
		onchange={() => {
			page.url.searchParams.set("page", pageNumber);
			goto(`?${page.url.searchParams.toString()}`, {
				invalidateAll: true,
			});
		}}
	></Pagination>
</div>

<dialog
	class="fixed inset-0 pt-0 m-auto overflow-auto max-w-3xl overscroll-y-none"
	bind:this={displayDialog}
	onclose={() => {
		history.back();
		entry = undefined;
	}}
>
	<div use:clickOutside={() => displayDialog?.close()}>
		{#if entry}
			<EntriesPage data={entry}></EntriesPage>
			<div class="flex justify-end mt-12">
				<button class="btn btn-outline" onclick={() => displayDialog?.close()}>Close</button>
			</div>
		{/if}
	</div>
</dialog>

<style>
	tr {
		display: grid;
		grid-template-columns: 256px 1fr auto;
		gap: calc(var(--spacing) * 6);
		align-items: start;
		padding-inline-start: calc(var(--spacing) * 2);

		content-visibility: auto;
		contain-intrinsic-size: auto 200px;
	}

	thead > tr {
		padding-inline-end: calc(var(--spacing) * 4);
		padding-block-end: calc(var(--spacing) * 2);
	}

	tbody > tr {
		padding-block: calc(var(--spacing) * 6);
	}

	th,
	td {
		padding: 0;
	}
</style>
