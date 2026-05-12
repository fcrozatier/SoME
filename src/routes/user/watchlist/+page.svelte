<script lang="ts">
	import { enhance } from "$app/forms";
	import { disableSubmitterAndSetValidity } from "$lib/actions.js";
	import LayoutSideBySide from "$lib/components/layouts/LayoutSideBySide.svelte";
	import Media from "$lib/components/Media.svelte";
	import { newToast } from "$lib/components/Toasts.svelte";
	import { makeTitle } from "$lib/utils/makeTitle";

	let { data } = $props();
</script>

<svelte:head>
	<title>{makeTitle("My Watchlist")}</title>
</svelte:head>

<article class="layout-prose">
	<h2>My watchlist</h2>
	<p>Save entries to watch and review later.</p>

	{#if data.watchlist.length === 0}
		<p>No entries to display.</p>
	{:else}
		<section class="mt-10">
			{#each data.watchlist as entry, i}
				<LayoutSideBySide side="right" mainPanelMinWidth="85%" sidePanelMaxWidth="64px">
					{#snippet mainPanel()}
						<Media {...entry} redirect="/vote" thumbnailWidth="256px" gap={6}></Media>
					{/snippet}
					{#snippet sidePanel()}
						<form
							action="?/remove"
							method="post"
							use:enhance={disableSubmitterAndSetValidity({
								async after({ result, update }) {
									if (result.type === "success") {
										await update();
										newToast({ type: "info", content: "Entry removed from watchlist" });
									}
								},
							})}
						>
							<input type="hidden" name="uid" value={entry.uid} />
							<button class="btn btn-sm"> remove </button>
						</form>
					{/snippet}
				</LayoutSideBySide>
				<hr class="my-8!" />
			{/each}
		</section>
	{/if}
</article>
