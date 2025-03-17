<script lang="ts">
	import { goto, preloadData, pushState } from "$app/navigation";
	import { page } from "$app/state";
	import { clickOutside } from "$lib/actions.js";
	import Pagination from "$lib/components/Pagination.svelte";
	import Thumbnail from "$lib/components/Thumbnail.svelte";
	import Youtube from "$lib/components/Youtube.svelte";
	import { categories } from "$lib/config.js";
	import { YOUTUBE_EMBED } from "$lib/utils";
	import type { ComponentProps } from "svelte";
	import EntriesPage from "../entries/[uid=uuid]/+page.svelte";

	let { data } = $props();

	let pages = $derived(data.pages);

	let category = $state(data.category);
	let year = $state(data.year);
	let pageNumber = $state(data.page);

	$inspect(pageNumber);

	const years = ["2023", "2022", "2021"];

	let displayDialog: HTMLDialogElement | undefined = $state();
	let entry: ComponentProps<typeof EntriesPage>["data"] | undefined = $state();

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
	<title>Archive &middot; SoME</title>
</svelte:head>

<section class="layout-prose pb-10">
	<p class=" mb-16 text-center text-3xl font-light">Archive</p>
	<form
		class="flex gap-3 justify-center"
		onchange={() => {
			page.url.searchParams.set("category", category);
			page.url.searchParams.set("year", year);
			page.url.searchParams.set("page", "1");
			pageNumber = "1";
			goto(`?${page.url.searchParams.toString()}`, {
				invalidateAll: true,
				keepFocus: true,
				noScroll: true,
			});
		}}
	>
		<div>
			<label for="year" class="label">
				<span class="label-text"> Year </span>
			</label>
			<select class="select-bordered select" bind:value={year} name="year" id="year">
				{#each years as year}
					<option value={year} selected={page.url.searchParams.get("year") === year}>{year}</option>
				{/each}
			</select>
		</div>
		<div>
			<label for="category" class="label">
				<span class="label-text"> Category </span>
			</label>
			<select class="select-bordered select" bind:value={category} name="category" id="category">
				{#each categories as category}
					<option value={category} selected={page.url.searchParams.get("category") === category}
						>{category}</option
					>
				{/each}
			</select>
		</div>
	</form>
	<div class="mt-10 mx-auto flex justify-center">
		{#key pages}
			<Pagination
				{pages}
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
		{/key}
	</div>
</section>

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
							<a href={url} target="_blank">
								<Thumbnail uid={thumbnail} width={256}></Thumbnail>
							</a>
						{:else}
							<a href={url} class="line-clamp-1" target="_blank">{url}</a>
						{/if}
					</td>
					<td>
						<h3 class="text-base text-balance line-clamp-2 text-trim mt-0">{title}</h3>
						{#if description}
							<p class="line-clamp-3">{description}</p>
						{/if}
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
	{#key pages}
		<Pagination
			{pages}
			bind:pageNumber
			onchange={() => {
				page.url.searchParams.set("page", pageNumber);
				goto(`?${page.url.searchParams.toString()}`, {
					invalidateAll: true,
				});
			}}
		></Pagination>
	{/key}
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
			<div class="-mx-8">
				<EntriesPage data={entry}></EntriesPage>
			</div>
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
