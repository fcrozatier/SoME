<script lang="ts">
	import Bento from "$lib/components/Bento.svelte";
	import Display from "$lib/components/Display.svelte";
	import Score from "$lib/components/Score.svelte";
	import { currentYear } from "$lib/config.js";
	import { makeTitle } from "$lib/utils/makeTitle.js";
	import { resultsAvailable } from "$lib/utils/time.js";
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

	const computeMedianScore = () => {
		if (data.entry.final_score) return round(+data.entry.final_score, 1);
		if (data.feedbacks.length === 0) return null;

		const sortedScores = data.feedbacks.map((f) => Number(f.score)).toSorted();
		const nbScores = sortedScores.length;
		const scoreMin = sortedScores[Math.floor((nbScores - 1) / 2)]!;
		const scoreMax = sortedScores[Math.floor(nbScores / 2)]!;

		return round((scoreMin + scoreMax) / 2, 1);
	};
	const median = $derived(computeMedianScore());
</script>

<svelte:head>
	<title>{makeTitle("Feedback")}</title>
</svelte:head>

<article class="layout-prose">
	<Display data={{ ...data.entry, tags: data.tags }}></Display>

	{#if data.feedbacks.length !== 0}
		<h3>Analytics</h3>
		{@const comments = data.feedbacks.filter((f) => f.feedback !== "" && !f.maybe_rude)}
		<div class="flex justify-center">
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-8 mb-10">
				<Bento count={median} color={true}>
					Overall <a
						href="/algorithm"
						target="_blank"
						class="no-underline hover:underline font-semibold">score*</a
					>
				</Bento>
				<Bento
					count={Number(data.entry.year) !== currentYear || resultsAvailable()
						? data.entry.rank
						: null}>Rank</Bento
				>
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
