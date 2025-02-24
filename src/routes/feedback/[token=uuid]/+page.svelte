<script lang="ts">
	import { COMPETITION_SHORT_NAME } from '$lib/config';
	import { round } from '@fcrozatier/ts-helpers';

	import * as Plot from '@observablehq/plot';

	function hist(node: HTMLElement, arg: { score: number }[]) {
		node.appendChild(
			Plot.plot({
				color: { scheme: 'RdYlGn', type: 'categorical' },
				marks: [
					Plot.rectY(
						arg,
						Plot.binX(
							{ y: 'count', fill: 'x', domain: [1, 9.5] },
							{ x: 'score', domain: [1, 9.5], interval: 0.5 },
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
	<h2>Feedbacks</h2>
	<p>Here is the feedback you received from people who reviewed your work.</p>
	{#if data.groups}
		{#each Object.entries(data.groups) as [title, group]}
			<h3>{title}</h3>
			{#if !group || group?.length === 0}
				<p>No feedback received on this entry yet</p>
			{:else}
				{@const median = round(group?.[0].median, 0)}
				{@const comments = group.filter((f) => f.feedback && f.feedback !== '' && !f.maybe_rude)}
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
								{median || '-'}
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
								{group.length}
							</span>
							<span>Votes</span>
						</div>
					</div>
					<div class="rounded-3xl border-2 aspect-square w-40 grid place-items-center">
						<div class="flex flex-col items-center gap-2">
							<span class="text-5xl">
								{comments.length}
							</span>
							<span>Comments</span>
						</div>
					</div>
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
								class="ml-auto w-full bg-opacity-10 border text-xs rounded-full aspect-square min-w-4 text-center px-2 flex items-center justify-center"
								class:bg-error={+score <= 3}
								class:bg-success={+score > 7}
								class:bg-warning={+score > 3 && +score <= 7}
								class:border-error={+score <= 3}
								class:border-success={+score > 7}
								class:border-warning={+score > 3 && +score <= 7}>{round(score, 1)}</span
							>
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
