<script lang="ts">
	import { goto, preloadData, pushState } from "$app/navigation";
	import { page } from "$app/state";
	import { clickOutside } from "$lib/actions.js";
	import Media from "$lib/components/Media.svelte";
	import Pagination from "$lib/components/Pagination.svelte";
	import { categories } from "$lib/config.js";
	import { setTitle } from "$lib/utils/setTitle";
	import type { ComponentProps } from "svelte";
	import EntriesPage from "../entries/[uid=uuid]/+page.svelte";
	import LayoutSideBySide from "$lib/components/layouts/LayoutSideBySide.svelte";

	let { data } = $props();

	let pages = $derived(data.pages);

	let category = $state(data.category);
	let year = $state(data.year);
	let pageNumber = $state(data.page);

	const years = ["2024", "2023", "2022", "2021"];

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

	setTitle("Archive");
</script>

<section class="layout-prose">
	<p class=" mb-16 text-center text-3xl font-light">Archive</p>
	<form
		class="flex gap-3 justify-center"
		onchange={() => {
			page.url.searchParams.set("category", category);
			page.url.searchParams.set("year", `${year}`);
			page.url.searchParams.set("page", "1");
			pageNumber = 1;
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
					page.url.searchParams.set("page", `${pageNumber}`);
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

<div class="px-4 mt-10">
	<div class="max-w-3xl mx-auto">
		<hr class="my-8!" />
		{#each data.entries as { uid, title, description, category, thumbnail, url, rank }}
			<div>
				<LayoutSideBySide side="right" contentMinSize="85%" sideWidth="64px">
					{#snippet mainPanel()}
						<Media
							{uid}
							{category}
							{title}
							{description}
							{url}
							{thumbnail}
							thumbnailWidth="256px"
							gap={6}
						></Media>
					{/snippet}
					{#snippet sidePanel()}
						<LayoutSideBySide
							side="left"
							gap={2}
							class="text-xs"
							contentMinSize="60%"
							alignment="center"
							sideWidth="8ch"
						>
							{#snippet mainPanel()}
								<div class="flex">
									<a
										class="btn btn-sm ml-auto w-[8ch] sm:ml-0"
										href={`/entries/${uid}`}
										onclick={loadData}
									>
										details
									</a>
								</div>
							{/snippet}
							{#snippet sidePanel()}
								<span class="text-trim text-center w-[8ch] inline-block">Rank {rank ?? "-"}</span>
							{/snippet}
						</LayoutSideBySide>
					{/snippet}
				</LayoutSideBySide>
				<hr class="my-8!" />
			</div>
		{/each}
	</div>
</div>

<div class="mt-10 mx-auto flex justify-center">
	{#key pages}
		<Pagination
			{pages}
			bind:pageNumber
			onchange={() => {
				page.url.searchParams.set("page", `${pageNumber}`);
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
	closedby="any"
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
