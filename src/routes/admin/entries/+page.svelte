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
	import { newToast } from "$lib/components/Toasts.svelte";

	let { data, form = $bindable() } = $props();

	let pageNumber = $state(Number(page.url.searchParams.get("page") ?? "1"));

	let flagDialog: HTMLDialogElement | undefined = $state();
	const selectedEntry = $state({ uid: "", title: "" });

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
				<div class="flex gap-2 flex-wrap justify-start">
					<a class="btn btn-neutral btn-sm" href={`/entries/${entry.uid}`} onclick={loadData}
						>Display
					</a>
					<a class="btn btn-sm" href={`/admin/update/${entry.uid}`}>Update</a>
					<button
						command="show-modal"
						commandfor="flag-dialog"
						onclick={() => {
							selectedEntry.uid = entry.uid;
							selectedEntry.title = entry.title;
							flagDialog?.showModal();
						}}
						class="btn btn-error btn-outline btn-sm">Flag</button
					>
				</div>
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

<dialog id="flag-dialog" class="m-auto w-[65ch]" bind:this={flagDialog} closedby="any">
	<form
		method="post"
		class="space-y-2"
		action="?/flag"
		use:clickOutside={() => flagDialog?.close()}
		use:enhance={() => {
			const buttons = document.querySelectorAll("button");
			buttons.forEach((b) => b.setAttribute("disabled", "on"));

			return async ({ result, update }) => {
				await update({ invalidateAll: true });
				buttons.forEach((b) => b.removeAttribute("disabled"));

				if (result.type === "success") {
					flagDialog?.close();
					newToast({ type: "info", content: "Entry flagged" });
				} else if (
					result.type === "failure" &&
					result.data?.issues !== null &&
					typeof result.data?.issues === "object"
				) {
					const message = Object.values(result.data.issues)?.[0]?.message ?? "";
					if (message) {
						newToast({ type: "error", content: message });
					}
				}
			};
		}}
	>
		<h2 class="mt-0">Flag entry</h2>
		<p class="text-gray-700 mb-0">
			This will flag the entry <em>"{selectedEntry.title}"</em>
		</p>

		<input type="hidden" name="uid" value={selectedEntry.uid} required />

		<p>
			<label for="reason" class="label text-sm block">Reason</label>
			<textarea name="reason" id="reason" class="textarea w-full" required></textarea>
		</p>

		<p class="mb-0 mt-8 flex items-center justify-end gap-2">
			<button
				type="button"
				class="btn-outline btn"
				commandfor="flag-dialog"
				command="request-close"
				onclick={() => flagDialog?.close()}>Cancel</button
			>
			<button type="submit" class="btn-outline btn-error btn">Flag</button>
		</p>
	</form>
</dialog>

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
