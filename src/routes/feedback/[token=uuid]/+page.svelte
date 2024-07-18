<script lang="ts">
	import { enhance } from '$app/forms';
	import { newToast } from '$lib/components/Toasts.svelte';
	import { COMPETITION_SHORT_NAME } from '$lib/config';
	import { round } from '@fcrozatier/ts-helpers';
	import type { ActionData, PageData } from './$types';

	import * as Plot from '@observablehq/plot';

	function hist(node: HTMLElement, arg: { score: number }[]) {
		node.appendChild(
			Plot.plot({
				color: { scheme: 'RdYlGn', type: 'categorical' },
				marks: [
					Plot.rectY(
						arg,
						Plot.binX(
							{ y: 'count', fill: 'x', domain: [1, 9] },
							{ x: 'score', domain: [1, 9], interval: 0.5 },
						),
					),
					Plot.ruleY([0]),
					Plot.ruleX([0]),
				],
			}),
		);
	}

	export let data: PageData;
	export let form: ActionData;

	let someValue = 5;
	let siteValue = 5;
	let feedback = '';

	let errorSummary: HTMLDivElement | undefined;

	$: if (form?.surveyFail) {
		errorSummary?.scrollIntoView();
	}
</script>

<svelte:head>
	<title>Feedback &middot; {COMPETITION_SHORT_NAME}</title>
</svelte:head>

<article class="layout-prose">
	{#if !data.surveyTaken && !form?.surveySuccess}
		<h2>Survey</h2>
		<p>
			We recognize that the results have not been announced yet, but in the meantime please consider
			filling out the following form:
		</p>

		<form
			method="post"
			class="space-y-4"
			use:enhance={({ submitter }) => {
				submitter?.setAttribute('disabled', 'on');
				return async ({ update, result }) => {
					if (result.type === 'success') {
						newToast({ type: 'success', content: 'Thank you for taking the survey! 🎉 🥳' });
					}
					submitter?.removeAttribute('disabled');
					await update();
				};
			}}
		>
			<div class="form-control gap-1">
				<label for="some" class="label flex gap-2">
					<span class="flex-1">
						How satisfied are you with the SoME event (communication/organization)?
					</span>
				</label>
				<input
					id="some"
					name="some"
					type="range"
					min="1"
					max="10"
					step="any"
					class="range range-sm"
					bind:value={someValue}
					class:range-error={someValue <= 3}
					class:range-success={someValue > 7}
					class:range-warning={someValue > 3 && someValue <= 7}
					required
				/>
				<div class="w-full flex justify-between text-xs px-1">
					{#each Array.from({ length: 10 }) as _, i}
						<button type="button" on:click={() => (someValue = i + 1)}>{i + 1}</button>
					{/each}
				</div>
				<div class="w-full flex justify-between text-xs px-1">
					<span>Not satisfied</span>

					<span>Very satisfied</span>
				</div>
			</div>
			<div class="form-control gap-1">
				<label for="site" class="label flex gap-2">
					<span class="flex-1">
						How satisfied are you with the Peer Review website this year?
					</span>
				</label>
				<input
					id="site"
					name="site"
					type="range"
					min="1"
					max="10"
					step="any"
					class="range range-sm"
					bind:value={siteValue}
					class:range-error={siteValue <= 3}
					class:range-success={siteValue > 7}
					class:range-warning={siteValue > 3 && siteValue <= 7}
					required
				/>
				<div class="w-full flex justify-between text-xs px-1">
					{#each Array.from({ length: 10 }) as _, i}
						<button type="button" on:click={() => (siteValue = i + 1)}>{i + 1}</button>
					{/each}
				</div>
				<div class="w-full flex justify-between text-xs px-1">
					<span>Not satisfied</span>

					<span>Very satisfied</span>
				</div>
			</div>
			<div class="form-control">
				<label for="feedback" class="label flex gap-2">
					<span class="flex-1">
						Do you have general feedback or ways you would like to see the Summer of Math Exposition
						improved next year? If so, please write it here:
					</span>
				</label>
				<textarea
					name="feedback"
					id="feedback"
					class="textarea-bordered textarea text-base"
					cols="50"
					rows="10"
					maxlength="5000"
					bind:value={feedback}
				></textarea>
				<div class="label justify-end">
					<span class="label-text-alt">{feedback.length}/5000</span>
				</div>
			</div>

			<p>
				<button class="btn btn-primary">Submit survey</button>
			</p>
			{#if form?.surveyFail}
				<p class="text-error" bind:this={errorSummary}>
					<span> Something went wrong. </span>
					{#if form?.reason}
						{form.reason}
					{:else}
						<span> Please try again later</span>
					{/if}
				</p>
			{/if}
		</form>
	{/if}

	<h2>Feedbacks</h2>
	<p>Here is the feedback you received from people who reviewed your work.</p>

	{#each Object.entries(data.groups) as [title, group]}
		<h3>{title}</h3>
		{#if !group || group?.length === 0}
			<p>No feedback received on this entry yet</p>
		{:else}
			{@const median = round(group?.[0].median, 1)}
			{@const comments = group.filter((f) => f.feedback !== '' && !f.maybe_rude)}
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
							{median}
						</span>
						<span
							>Overall <button
								on:click={() =>
									newToast({
										type: 'info',
										content:
											'Your median score. <a class="underline underline-offset-2 inline cursor-pointer" href="/algorithm">Learn more</a>',
										duration: 5000,
									})}
								class="font-semibold">score*</button
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
					<div class="grid grid-cols-[1fr_2rem] items-start border-b first:border-t py-4">
						<p class="my-0 leading-loose whitespace-pre-wrap">{feedback}</p>
						<span
							class="ml-auto w-full bg-opacity-10 border text-xs rounded-full aspect-square min-w-4 text-center px-2 flex items-center justify-center"
							class:bg-error={median <= 3}
							class:bg-success={median > 7}
							class:bg-warning={median > 3 && median <= 7}
							class:border-error={median <= 3}
							class:border-success={median > 7}
							class:border-warning={median > 3 && median <= 7}>{round(score, 1)}</span
						>
					</div>
				{/each}
			{/if}
		{/if}
	{:else}
		<p>No entry found</p>
	{/each}
</article>
