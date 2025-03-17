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
		onChange={() => {
			page.url.searchParams.set("page", pageNumber);
			goto(`?${page.url.searchParams.toString()}`, {
				invalidateAll: true,
				keepFocus: true,
				noScroll: true,
			});
		}}
	></Pagination>
</div>

<div class="overflow-x-scroll mx-4">
	<table class="table max-w-3xl min-w-xl mx-auto">
		<thead>
			<tr>
				<th>Entry</th>
				<th>Title</th>
				<th>Rank</th>
			</tr>
		</thead>
		<tbody>
			{#each data.entries as { uid, title, description, category, thumbnail, url, rank }}
				<tr>
					<td>
						{#if category === "video" && url && YOUTUBE_EMBED.test(url)}
							<Youtube src={url} {title}></Youtube>
						{:else if thumbnail && url && !YOUTUBE_EMBED.test(url)}
							<a href={url} target="_blank" class="w-[272px]">
								<Thumbnail uid={thumbnail} width={272}></Thumbnail>
							</a>
						{:else}
							<a href={url} target="_blank">{url} </a>
						{/if}
					</td>
					<td>
						<h3 class="max-w-sm text-base text-balance line-clamp-2 text-trim mt-0">{title}</h3>
						<p class="line-clamp-3">{description}</p>
					</td>
					<td class="text-trim text-end">
						<a class="mr-4 btn btn-sm" href={`/entries/${uid}`} onclick={loadData}> details </a>
						{rank ? `#${rank}` : "-"}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<!-- <div class="sm:hidden grid justify-center gap-8">
	{#each data.entries as { uid, title, category, thumbnail, url, rank }}
		<div>
			{#if category === "video" && url && YOUTUBE_EMBED.test(url)}
				<Youtube src={url} width={320}></Youtube>
			{:else if thumbnail && url && !YOUTUBE_EMBED.test(url)}
				<a href={url} target="_blank" class="w-[320px]">
					<Thumbnail uid={thumbnail} width={320}></Thumbnail>
				</a>
			{:else}
				<a href={url} target="_blank">{url} </a>
			{/if}
			<div>
				<span>#{rank}</span><a href={`/entries/${uid}`} onclick={loadData}
					><h3 class="max-w-xs text-base m-0">{title}</h3>
				</a>
			</div>
		</div>
	{/each}
</div> -->

<div class="mt-10 mx-auto flex justify-center">
	<Pagination
		pages={data.pages}
		bind:pageNumber
		onChange={() => {
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
	<article use:clickOutside={() => displayDialog?.close()}>
		{#if entry}
			<EntriesPage data={entry}></EntriesPage>
			<p class="flex gap-2 mt-12">
				<button class="btn btn-outline" onclick={() => displayDialog?.close()}>Close</button>
			</p>
		{/if}
	</article>
</dialog>

<style>
	tr {
		display: grid;
		grid-template-columns: 256px 1fr auto;
		gap: calc(var(--spacing) * 8);
		align-items: start;
		padding-inline-start: calc(var(--spacing) * 2);
	}

	thead > tr {
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
