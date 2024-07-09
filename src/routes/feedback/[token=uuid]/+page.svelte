<script lang="ts">
	import { enhance } from '$app/forms';
	import { PUBLIC_RESULTS_AVAILABLE } from '$env/static/public';
	import { newToast } from '$lib/components/Toasts.svelte';
	import { COMPETITION_SHORT_NAME } from '$lib/config';
	import type { ActionData, PageData } from './$types';

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
		{#if group}
			<p class="font-semibold">Overall score: {group[0].score}</p>
			{#if group.filter((f) => f.feedback !== '').length > 0}
				<p class="font-semibold">Comments</p>
				<hr />
				{#each group as { feedback }}
					{#if feedback !== ''}
						<p class="whitespace-pre-wrap">{feedback}</p>
						<hr />
					{/if}
				{/each}
			{:else}
				<p>No feedback received on this entry</p>
			{/if}
		{/if}
	{/each}
</article>
