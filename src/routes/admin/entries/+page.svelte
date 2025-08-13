<script lang="ts">
	import { enhance } from "$app/forms";
	import { goto, preloadData, pushState } from "$app/navigation";
	import { page } from "$app/state";
	import { clickOutside, disableSubmitterAndSetValidity } from "$lib/actions";
	import LayoutSideBySide from "$lib/components/layouts/LayoutSideBySide.svelte";
	import Media from "$lib/components/Media.svelte";
	import Pagination from "$lib/components/Pagination.svelte";
	import type { ComponentProps } from "svelte";
	import EntriesPage from "../../entries/[uid=uuid]/+page.svelte";

	let { data, form = $bindable() } = $props();

	let pageNumber = $state(Number(page.url.searchParams.get("page") ?? "1"));

	let displayDialog: HTMLDialogElement | undefined = $state();
	let entryPageData: ComponentProps<typeof EntriesPage>["data"] | undefined = $state();

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
			entryPageData = result.data;
			displayDialog?.showModal();
			displayDialog?.scrollTo({ top: 0 });
		} else {
			goto(href);
		}
	}
</script>

<article class="mx-auto w-4/5 max-w-5xl">
	<h2>Entries to review</h2>

	<div class="mb-10 mx-auto flex justify-center">
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

	{#each data.entries as entry (entry.uid)}
		<LayoutSideBySide side="right" mainPanelMinWidth="85%" sidePanelMaxWidth="64px">
			{#snippet mainPanel()}
				<Media {...entry} thumbnailWidth="256px" gap={6}></Media>
			{/snippet}
			{#snippet sidePanel()}
				<form
					class="flex gap-2 flex-wrap justify-start"
					method="POST"
					use:enhance={disableSubmitterAndSetValidity({
						invalidateAll: true,
						toast: { success: { type: "info", content: "Entry deactivated" } },
					})}
				>
					<input type="hidden" name="uid" value={entry.uid} />
					<a class="btn btn-neutral btn-sm" href={`/entries/${entry.uid}`} onclick={loadData}
						>Display
					</a>
					<a class="btn btn-sm" href={`/admin/update/${entry.uid}`}>Update</a>
					<button formaction="?/deactivate" class="btn btn-error btn-outline btn-sm"
						>Deactivate</button
					>
				</form>
			{/snippet}
		</LayoutSideBySide>
		<hr class="my-8!" />
	{:else}
		<p class="px-6">No entries to review</p>
	{/each}

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
	class="m-auto w-full"
	bind:this={displayDialog}
	closedby="any"
	onclose={() => {
		history.back();
		entryPageData = undefined;
	}}
>
	<div use:clickOutside={() => displayDialog?.close()}>
		{#if entryPageData}
			<div class="-mx-8">
				<EntriesPage data={entryPageData}></EntriesPage>
			</div>
			<p class="flex gap-2 justify-end">
				<button class="btn btn-outline hover:btn-neutral" onclick={() => displayDialog?.close()}
					>Close</button
				>
				<a
					class="btn btn-outline hover:btn-neutral"
					href={`/admin/update/${entryPageData.entry.uid}`}>Update</a
				>
			</p>
		{/if}
	</div>
</dialog>
