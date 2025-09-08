<script lang="ts">
	import { enhance } from "$app/forms";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import LayoutSideBySide from "$lib/components/layouts/LayoutSideBySide.svelte";
	import Media from "$lib/components/Media.svelte";
	import Pagination from "$lib/components/Pagination.svelte";
	import Score from "$lib/components/Score.svelte";
	import { newToast } from "$lib/components/Toasts.svelte";

	let { data } = $props();

	let pageNumber = $state(Number(page.url.searchParams.get("page") ?? "1"));
</script>

<article class="layout-prose">
	<h2>Rank {page.params.category} entries</h2>

	<form
		method="post"
		action="?/rank"
		use:enhance={({ submitter }) => {
			submitter?.setAttribute("disabled", "on");

			return async ({ update, result }) => {
				await update();
				submitter?.removeAttribute("disabled");
				if (result.type === "success") {
					newToast({ content: "Entries ranked!", type: "success" });
				}
			};
		}}
	>
		<button class="btn-neutral btn" type="submit" disabled>Rank</button>
	</form>

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

	{#each data.entries as { ranking, overall_median, teacher_median, ...entry }}
		<LayoutSideBySide side="right" mainPanelMinWidth="75%" sidePanelMaxWidth="100px">
			{#snippet mainPanel()}
				<Media {...entry} thumbnailWidth="256px" gap={6}></Media>
			{/snippet}
			{#snippet sidePanel()}
				<div class="grid grid-cols-2 gap-y-2 items-center">
					<b>Rank</b> <span class="w-16 text-center text-sm">{ranking}</span>
					<b>Overall</b>
					<Score score={overall_median}></Score>
					<b>Teachers</b>
					<Score score={teacher_median}></Score>
				</div>
			{/snippet}
		</LayoutSideBySide>
		<hr class="my-8!" />
	{/each}
</article>
