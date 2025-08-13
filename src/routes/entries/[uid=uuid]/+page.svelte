<script lang="ts">
	import Bento from "$lib/components/Bento.svelte";
	import Display from "$lib/components/Display.svelte";
	import { makeTitle } from "$lib/utils/makeTitle.js";
	import { round } from "@fcrozatier/ts-helpers";
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
	<Display data={{ ...data.entry, tags: data.tags }}></Display>

	{#if data.feedbacks.length !== 0}
		<h3>Analytics</h3>
		{@const median = data.entry.final_score ? round(+data.entry.final_score, 1) : 0}
		{@const comments = data.feedbacks.filter((f) => f.feedback !== "" && !f.maybe_rude)}
		<div class="flex justify-center">
			<div class="grid grid-cols-2 gap-x-8 gap-y-8 mb-10">
				<Bento count={median} color={median <= 3 ? "danger" : median < 7 ? "warning" : "success"}>
					Overall <a
						href="/algorithm"
						target="_blank"
						class="no-underline hover:underline font-semibold">score*</a
					>
				</Bento>
				<Bento count={data.entry.rank}>Rank</Bento>
				<Bento count={data.feedbacks.length}>
					Vote{data.feedbacks.length === 1 ? "" : "s"}
				</Bento>
				<Bento count={comments.length}>
					Comment{comments.length === 1 ? "" : "s"}
				</Bento>
			</div>
		</div>

		<div
			use:hist={data.feedbacks.map((i) => ({
				score: +i.score,
			}))}
		></div>

		{#if comments.length > 0}
			<h3>Comments</h3>

			{#each comments as { feedback, score }}
				<div class="grid grid-cols-[1fr_2rem] items-start border-b gap-x-4 first:border-t py-4">
					<div class="prose">{@html feedback}</div>
					<span
						class={`ml-auto w-full border text-xs rounded-full aspect-square min-w-4 text-center px-2 flex items-center justify-center
							${+score <= 3 ? "bg-error/10 border-error" : ""}
							${+score > 3 && +score <= 7 ? "bg-warning/10 border-warning" : ""}
							${+score > 7 ? "bg-success/10 border-success" : ""}
						`}
					>
						{round(+score, 1)}
					</span>
				</div>
			{/each}
		{/if}
	{/if}
</article>
