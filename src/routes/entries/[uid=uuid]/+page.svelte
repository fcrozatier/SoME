<script lang="ts">
	import Display from "$lib/components/Display.svelte";
	import { newToast } from "$lib/components/Toasts.svelte";
	import { COMPETITION_SHORT_NAME } from "$lib/config";
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
	<title>Feedback &middot; {COMPETITION_SHORT_NAME}</title>
</svelte:head>

<article class="layout-prose">
	<Display data={data.entry}></Display>

	{#if data.feedbacks.length !== 0}
		<h3>Analytics</h3>
		{@const median = data.entry.final_score ? round(+data.entry.final_score, 1) : 0}
		{@const comments = data.feedbacks.filter((f) => f.feedback !== "" && !f.maybe_rude)}
		<div class="flex flex-wrap justify-start justify-items-center mx-4 gap-x-8 gap-y-8 my-10">
			<div
				class="rounded-[2rem] bg-opacity-10 border-2 aspect-square w-40 grid place-items-center"
				class:bg-error={median <= 3}
				class:bg-success={median > 7}
				class:bg-warning={median > 3 && median <= 7}
				class:border-error={median <= 3}
				class:border-success={median > 7}
				class:border-warning={median > 3 && median <= 7}
			>
				<div class="flex flex-col items-center gap-2">
					<span
						class="text-5xl"
						class:text-error={median <= 3}
						class:text-success={median > 7}
						class:text-warning={median > 3 && median <= 7}
					>
						{median || "-"}
					</span>
					<span
						>Overall <a
							href="/algorithm"
							target="_blank"
							class="no-underline hover:underline font-semibold">score*</a
						></span
					>
				</div>
			</div>
			<div class="rounded-3xl border-2 aspect-square w-40 max-w-sm grid place-items-center">
				<div class="flex flex-col items-center gap-2">
					<span class="text-5xl">
						{data.feedbacks.length}
					</span>
					<span>Vote{data.feedbacks.length === 1 ? "" : "s"}</span>
				</div>
			</div>
			<div class="rounded-3xl border-2 aspect-square w-40 grid place-items-center">
				<div class="flex flex-col items-center gap-2">
					<span class="text-5xl">
						{comments.length}
					</span>
					<span>Comment{comments.length === 1 ? "" : "s"}</span>
				</div>
			</div>
			<div class="rounded-3xl border-2 aspect-square w-40 grid place-items-center">
				<div class="flex flex-col items-center gap-2 relative -top-2">
					<span class="">Rank</span>
					<span class="text-5xl">
						{data.entry.rank ?? "-"}
					</span>
				</div>
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
					<p class="my-0 leading-loose whitespace-pre-wrap">{feedback}</p>
					<span
						class="ml-auto w-full bg-opacity-10 border text-xs rounded-full aspect-square min-w-4 text-center px-2 flex items-center justify-center"
						class:bg-error={+score <= 3}
						class:bg-success={+score > 7}
						class:bg-warning={+score > 3 && +score <= 7}
						class:border-error={+score <= 3}
						class:border-success={+score > 7}
						class:border-warning={+score > 3 && +score <= 7}>{round(+score, 1)}</span
					>
				</div>
			{/each}
		{/if}
	{/if}
</article>
