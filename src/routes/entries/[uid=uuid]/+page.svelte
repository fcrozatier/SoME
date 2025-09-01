<script lang="ts">
	import Bento from "$lib/components/Bento.svelte";
	import Display from "$lib/components/Display.svelte";
	import Score from "$lib/components/Score.svelte";
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
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-8 mb-10">
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

		<div class="flex justify-center">
			<div
				use:hist={data.feedbacks.map((i) => ({
					score: +i.score,
				}))}
			></div>
		</div>

		{#if comments.length > 0}
			<h3>Comments</h3>

			{#each comments as { feedback, score }}
				<div class="border-b first:border-t py-4">
					<div class="float-right">
						<Score score={+score}></Score>
					</div>
					<div class="prose wrap-anywhere">{@html feedback}</div>
				</div>
			{/each}
		{/if}
	{/if}
</article>
