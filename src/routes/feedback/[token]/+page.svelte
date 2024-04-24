<script lang="ts">
	import { enhance } from '$app/forms';
	import { PUBLIC_RESULTS_AVAILABLE } from '$env/static/public';
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
	<!-- {#if Date.parse(PUBLIC_RESULTS_AVAILABLE) > Date.now()}
		<header class="text-green-600">
			<p>
				Hey! Good job on finding this route, it's not officially open but you can already check your
				feedback (at your own risk)
			</p>
		</header>
	{/if} -->

	<p>
		We have been blown away by the quality of submissions this year. We hope that this competition
		has both inspired new content creators and introduced these creators to an audience that
		appreciates them.
	</p>

	{#if !data.surveyTaken && !form?.surveySuccess}
		<p>
			We recognize that the winners have not been announced, but while we are waiting on Grant,
			James, and their panel of esteemed guest judges to finish judging, please consider filling out
			the following form:
		</p>

		<form
			method="post"
			class="space-y-4"
			use:enhance={({ submitter }) => {
				submitter?.setAttribute('disabled', 'on');
				return async ({ update }) => {
					await update();
					submitter?.removeAttribute('disabled');
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
					maxlength="2000"
					bind:value={feedback}
				></textarea>
				<div class="label justify-end">
					<span class="label-text-alt">{feedback.length}/2000</span>
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
	{:else if form?.surveySuccess}
		<p class="text-green-600">Thank you for taking the survey!</p>
	{/if}
	{#if data.feedbacks.length > 0}
		<h2>Feedbacks</h2>
		<p>
			During the Peer Review, we collected feedback from those who have been judging your work and
			will be providing this feedback to you now. Please take it with a grain or two of salt. At the
			end of the day, these are just the opinions of random people on the internet. On the other
			hand, they are random people on the internet who decided to spend an afternoon or two
			analyzing math content for fun. So they are probably in your target audience and it’s
			important to hear what they have to say.
		</p>
		<p>With that said, here is the feedback we have associate with your entry:</p>
		{#each data.feedbacks as feedback, i}
			<h3>Feedback {i + 1}</h3>
			<p class="whitespace-pre-wrap">{feedback}</p>
		{/each}
	{/if}
</article>
