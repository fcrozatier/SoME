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
				color: { scheme: "RdYlGn", type: "linear", domain: [1, 9.5] },
				marks: [
					Plot.rectY(arg, Plot.binX({ y: "count", fill: "x" }, { x: "score", interval: 0.5 })),
					Plot.ruleY([0]),
					Plot.tickX([9.5], { opacity: 0 }),
					Plot.ruleX([1]),
				],
				y: {
					// display horizontal rules
					// grid: true,
					// We don't expect more than 100 votes on an entry
					ticks: Array.from({ length: 100 }, (_, i) => i + 1),
					tickFormat: (d: number) => (Number.isInteger(d) ? d.toString() : ""),
				},
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
		<!-- Only filter comments maybe_rude here -->
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

			{#each comments as { feedback, score, username, bio, is_teacher }, i}
				<div class="border-b first:border-t py-4">
					<div class="float-right">
						<Score score={+score}></Score>
					</div>
					{#if data.isAdmin}
						<div>
							<button
								class={{ "font-medium cursor-pointer": bio?.length }}
								popovertarget={`bio-${i}`}
								popovertargetaction="toggle"
								disabled={!bio}>{username}</button
							>
							<div id={`bio-${i}`} popover>{bio}</div>
							{#if is_teacher}
								<span class="tag">teacher</span>
							{/if}
						</div>
					{/if}
					<div class="prose wrap-anywhere">{@html feedback}</div>
				</div>
			{/each}
		{/if}
	{/if}
</article>

<style>
	[id|="bio"] {
		margin-block: 1em;
		padding: 1em;
		position-area: top span-right;
		background: white;
		color: black;
		outline: 1px solid var(--color-primary);
		border-radius: 1em;
		max-width: var(--w-prose);
	}
</style>
