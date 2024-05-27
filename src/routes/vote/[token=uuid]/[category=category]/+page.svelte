<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { clickOutside } from '$lib/actions';
	import type { ActionData, PageData } from './$types';
	import { PUBLIC_S3_BUCKET } from '$env/static/public';
	import { YOUTUBE_EMBED, YOUTUBE_EMBEDDABLE } from '$lib/utils';
	import { PUBLIC_S3_ENDPOINT } from '$env/static/public';
	import NewVote from '$lib/components/NewVote.svelte';
	import Youtube from '$lib/components/Youtube.svelte';
	import Slider from '$lib/components/Slider.svelte';

	export let data: PageData;
	export let form: ActionData;

	let flagDialog: HTMLDialogElement;
	let guidelines: HTMLDialogElement;

	let flagEntry: EntryProperties | null = null;

	let score = 5;
	let feedback = '';
</script>

<article class="layout-prose">
	{#if form?.id === 'FLAG' && form?.flagSuccess}
		<div>
			<p class="text-success">Entry flagged. Thank you</p>

			<NewVote {page} />
		</div>
	{:else if form?.id === 'VOTE' && form?.voteFail}
		<div>
			<p class="text-error">
				<span> Something went wrong. </span>

				{#if form?.id === 'VOTE' && form?.voteFail && form?.reason}
					<span>{form?.reason}</span>
				{/if}
			</p>
			<NewVote {page} />
		</div>
	{:else if form?.id === 'VOTE' && form?.voteSuccess}
		<div>
			<p class="text-success">Thank you !</p>

			<NewVote {page} />
		</div>
	{:else if data.stopVote}
		<div>
			<p class="text-success">Thank you for participating!</p>

			<NewVote {page} displayCategories="others-only" />
		</div>
	{:else}
		<div>
			<h3>{data.title}</h3>
			<p>{data.description}</p>
			<div class="flex justify-center">
				{#if data.category === 'video' && YOUTUBE_EMBED.test(data.url)}
					<Youtube src={data.url} width={560}></Youtube>
				{/if}
			</div>
		</div>
		<form
			method="post"
			action="?/vote"
			class="space-y-4"
			use:enhance={() => {
				const buttons = document.querySelectorAll('button');
				buttons.forEach((b) => b.setAttribute('disabled', 'on'));
				return async ({ update }) => {
					await update();
					buttons.forEach((b) => b.removeAttribute('disabled'));
				};
			}}
		>
			<input type="hidden" value={data.uid} name="entry" />
			<div class="form-control gap-1">
				<h3 class="mb-0">Vote</h3>
				<p class="mb-4">
					How valuable is this entry to the space of online math exposition, compared to the typical
					math {data.category === 'video' ? 'video' : 'article'} you've seen?
					<button
						class="font-semibold hover:underline text-sm"
						on:click={() => guidelines.showModal()}>(Guidelines*)</button
					>
				</p>
				<Slider
					name="score"
					label1="Notably worse"
					label5="About the same"
					label9="Outstanding"
					label3="Not as good"
					label7="Better than most"
					bind:value={score}
				></Slider>
			</div>

			<div class="form-control">
				<h4 class="mb-0 mt-2">Feedback</h4>
				<label for="feedback" class="label flex gap-2">
					<span class="flex-1">
						Do you have general feedback for the author of this entry? If so, please remember to be
						as constructive as possible in your comments:
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
					<span class="label-text-alt">{feedback?.length}/2000</span>
				</div>
			</div>

			<p>
				<button class="btn btn-primary">Vote</button>
			</p>
			<!-- {#if form?.surveyFail}
				<p class="text-error" bind:this={errorSummary}>
					<span> Something went wrong. </span>
					{#if form?.reason}
						{form.reason}
					{:else}
						<span> Please try again later</span>
					{/if}
				</p>
			{/if} -->
		</form>

		<section class="layout-prose">
			<p>
				If an entry is inappropriate or does not follow the <a href="/#rules">rules</a> you can flag
				it and we will review it manually.
			</p>
		</section>
	{/if}
</article>

<dialog class="relative" bind:this={guidelines}>
	<article use:clickOutside={() => guidelines.close()}>
		<h2 id="guidlines" class="text-center mt-0 mb-8">Guidelines</h2>

		<p>When scoring an entry you might consider the following principles:</p>

		<h3>Motivation</h3>
		<p>Is it clear by the end of the introduction why one should care for the topic?</p>

		<h3>Clarity</h3>
		<p>
			Would the explanations make sense for the target audience? Jargon should be explained, the
			goals of the lesson should be understandable with minimal background, and the submission
			should generally display empathy for people unfamiliar with the topic
		</p>

		<h3>Novelty</h3>
		<p>
			Is there something unique to this entry which would make it worth sharing? It could have its
			own unique style, or a new way of presenting a common topic, or it could be surfacing an
			otherwise obscure idea which more people should know about.
		</p>

		<h3>Memorability</h3>
		<p>
			Is there a takeaway the audience would easily remember weeks later? Maybe it's an impactful
			change in perspective, the beauty of an explanation, or the mind-blowingness of an aha moment
		</p>

		<p class="text-center mt-8 mb-2">
			<button type="button" class="btn-outline btn" on:click={() => guidelines.close()}
				>Close</button
			>
		</p>
	</article>
</dialog>

<dialog class="mb-auto" bind:this={flagDialog}>
	<form
		method="post"
		action="?/flag"
		use:clickOutside={() => flagDialog.close()}
		use:enhance={() => {
			const buttons = document.querySelectorAll('button');
			buttons.forEach((b) => b.setAttribute('disabled', 'on'));
			return async ({ result }) => {
				// Do not force a page update here to prevent assigning a new pair in case the user doesn't want to keep voting.
				await applyAction(result);
				buttons.forEach((b) => b.removeAttribute('disabled'));
				flagDialog.close();
			};
		}}
	>
		<h2 class="mt-0">Is there something wrong?</h2>
		<p class="text-gray-700">You can report an entry if:</p>
		<ul>
			<li>it is inappropriate / suspicious</li>

			<li>it does not respect the rules</li>

			<li>you cannot proceed (wrong platform etc.)</li>
		</ul>
		<p>In any case please provide a reason. The entry will be reviewed by admins.</p>
		<span class="capitalize">{flagEntry?.title}</span>
		<label for="reason" class="label">Reason</label>
		<input
			id="reason"
			type="text"
			name="reason"
			maxlength="100"
			class="input-bordered input w-full"
			required
		/>
		<input type="hidden" name="link" value={flagEntry?.link} />
		<p class="mb-0 flex items-center gap-2">
			<button type="button" class="btn-outline btn" on:click={() => flagDialog.close()}
				>Cancel</button
			>
			<button type="submit" class="btn-outline btn-error btn">Report </button>
			{#if form?.id === 'FLAG' && form?.flagFail}
				<p class="text-error">Something went wrong.</p>
			{/if}
		</p>
	</form>
</dialog>