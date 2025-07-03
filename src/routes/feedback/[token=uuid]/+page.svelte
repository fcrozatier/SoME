<script lang="ts">
	import Bento from "$lib/components/Bento.svelte";
	import { round } from "@fcrozatier/ts-helpers";

	import { makeTitle } from "$lib/utils/makeTitle.js";
	import * as Plot from "@observablehq/plot";

	function hist(node: HTMLElement, arg: { score: number }[]) {
		node.appendChild(
			Plot.plot({
				color: { scheme: "RdYlGn", type: "categorical" },
				marks: [
					Plot.rectY(
						arg,
						Plot.binX(
							{ y: "count", fill: "x", domain: [1, 9.5] },
							{ x: "score", domain: [1, 9.5], interval: 0.5 },
						),
					),
					Plot.ruleY([0]),
					Plot.tickX([9.5], { opacity: 0 }),
					Plot.ruleX([1]),
				],
			}),
		);
	}

	let { data } = $props();
</script>

<svelte:head>
	<title>{makeTitle("Feedback")}</title>
</svelte:head>

<article class="layout-prose">
	<h2>Feedbacks</h2>
	<p>Here is the feedback you received from people who reviewed your work.</p>
	{#if data.groups}
		{#each Object.entries(data.groups) as [title, group]}
			<h3>{title}</h3>
			{#if !group || group?.length === 0}
				<p>No feedback received on this entry yet</p>
			{:else}
				{@const median = round(group?.[0]?.median!, 0)}
				{@const comments = group.filter((f) => f.feedback && f.feedback !== "" && !f.maybe_rude)}

				<div class="flex flex-wrap justify-center gap-x-8 gap-y-8 mb-10">
					<Bento count={median} color={median <= 3 ? "danger" : median < 7 ? "warning" : "success"}>
						Overall <a
							href="/algorithm"
							target="_blank"
							class="no-underline hover:underline font-semibold">score*</a
						>
					</Bento>
					<Bento count={group.length}>
						Vote{group.length === 1 ? "" : "s"}
					</Bento>
					<Bento count={comments.length}>
						Comment{comments.length === 1 ? "" : "s"}
					</Bento>
				</div>

				<div
					use:hist={group.map((i) => ({
						score: +i.score,
					}))}
				></div>

				{#if comments.length > 0}
					<p class="font-semibold">Comments</p>

					{#each comments as { feedback, score }}
						<div class="grid grid-cols-[1fr_2rem] gap-x-4 items-start border-b first:border-t py-4">
							<p class="my-0 leading-loose whitespace-pre-wrap">{feedback}</p>
							<span
								class={`ml-auto w-full border text-xs rounded-full aspect-square min-w-4 text-center px-2 flex items-center justify-center
								${+score <= 3 ? "bg-error/10 border-error" : ""}
								${+score > 3 && +score <= 7 ? "bg-warning/10 border-warning" : ""}
								${+score > 7 ? "bg-success border-success" : ""}
							`}
							>
								{round(score, 1)}
							</span>
						</div>
					{/each}
				{/if}
			{/if}
		{:else}
			<p>No entry found</p>
		{/each}
	{:else}
		<p>Nothing here yet</p>
	{/if}
</article>
