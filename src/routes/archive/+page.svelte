<script lang="ts">
	import { goto, preloadData, pushState } from '$app/navigation';
	import { page } from '$app/state';
	import { clickOutside } from '$lib/actions.js';
	import Pagination from '$lib/components/Pagination.svelte';
	import Thumbnail from '$lib/components/Thumbnail.svelte';
	import Youtube from '$lib/components/Youtube.svelte';
	import { categories, type Category } from '$lib/config.js';
	import type { ComponentProps } from 'svelte';
	import EntriesPage from '../entries/[uid=uuid]/+page.svelte';

	let { data } = $props();

	let pages = $derived(data.pages);

	let category: Category = $state('video');
	let year: string = $state('2023');
	let pageNumber = $state(page.url.searchParams.get('page') ?? '1');

	const years = ['2023', '2022', '2021'];

	let displayDialog: HTMLDialogElement | undefined = $state();
	let entry: ComponentProps<typeof EntriesPage>['data'] | undefined = $state();

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

		if (result.type === 'loaded' && result.status === 200) {
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
			page.url.searchParams.set('category', category);
			page.url.searchParams.set('year', year);
			page.url.searchParams.set('page', '1');
			pageNumber = '1';
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
					<option value={year} selected={page.url.searchParams.get('year') === year}>{year}</option>
				{/each}
			</select>
		</div>
		<div>
			<label for="category" class="label">
				<span class="label-text"> Category </span>
			</label>
			<select class="select-bordered select" bind:value={category} name="category" id="category">
				{#each categories as category}
					<option value={category} selected={page.url.searchParams.get('category') === category}
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
				onChange={() => {
					page.url.searchParams.set('page', pageNumber);
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

<table class="table max-w-3xl mx-auto hidden sm:block">
	<thead>
		<tr>
			<th>Entry</th>
			<th class="hidden sm:block">Title</th>
			<th>Rank</th>
		</tr>
	</thead>
	<tbody>
		{#each data.entries as { uid, title, category, thumbnail, url, rank }}
			<tr class="py-2">
				<td>
					{#if category === 'video'}
						<Youtube width={240} src={url}></Youtube>
					{:else if thumbnail}
						<a href={url} target="_blank" class="w-[240px]">
							<Thumbnail uid={thumbnail} width={240}></Thumbnail>
						</a>
					{/if}
				</td>
				<td>
					<a href={`/entries/${uid}`} onclick={loadData}>
						<h3 class="max-w-sm text-base m-0">{title}</h3>
					</a>
				</td>
				<td>#{rank}</td>
			</tr>
		{/each}
	</tbody>
</table>

<div class="sm:hidden grid justify-center gap-8">
	{#each data.entries as { uid, title, category, thumbnail, url, rank }}
		<div>
			{#if category === 'video'}
				<Youtube width={320} src={url}></Youtube>
			{:else if thumbnail}
				<a href={url} target="_blank" class="w-[320px]">
					<Thumbnail uid={thumbnail} width={320}></Thumbnail>
				</a>
			{/if}
			<div>
				<span>#{rank}</span><a href={`/entries/${uid}`} onclick={loadData}
					><h3 class="max-w-xs text-base m-0">{title}</h3>
				</a>
			</div>
		</div>
	{/each}
</div>

<div class="mt-10 mx-auto flex justify-center">
	{#key pages}
		<Pagination
			{pages}
			bind:pageNumber
			onChange={() => {
				page.url.searchParams.set('page', pageNumber);
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
		grid-template-columns: 240px 1fr auto;
		gap: 2rem;
		align-items: start;

		@media (max-width: 640px) {
			grid-template-columns: 1fr auto;
		}
	}

	tr:nth-child(even) {
		background-color: rgb(242, 242, 242);
	}
</style>
