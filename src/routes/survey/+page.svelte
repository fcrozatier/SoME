<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { newToast } from '$lib/components/Toasts.svelte';

	export let data;
	export let form;

	let someValue = 5;
	let siteValue = 5;
	let feedback = '';

	let errorSummary: HTMLDivElement | undefined;

	$: if (form?.surveyFail) {
		errorSummary?.scrollIntoView();
	}
</script>

<article class="layout-prose">
	{#if !data.surveyTaken && !form?.surveySuccess}
		<h2>Survey</h2>

		<form
			method="post"
			class="space-y-4"
			use:enhance={({ submitter }) => {
				submitter?.setAttribute('disabled', 'on');
				return async ({ update, result }) => {
					if (result.type === 'success') {
						newToast({ type: 'success', content: 'Thank you for taking the survey! 🎉 🥳' });
						await goto('/');
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
					step=".01"
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
					step=".01"
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
				<label for="off_season" class="label flex gap-2">
					<span class="flex-1">
						For the off-season, would you like the site to feature a Hacker News/Reddit style
						leaderboard showcasing the hotttest science content of the month, along with a monthly
						digest or newsletter?
					</span>
				</label>
				<div class="flex items-center gap-4">
					<div class="flex items-center gap-2">
						<input name="offSeason" id="yes" class="radio" type="radio" value="yes" />
						<label for="yes"> Yes </label>
					</div>
					<div class="flex items-center gap-2">
						<input name="offSeason" id="no" class="radio" type="radio" value="no" />
						<label for="no"> No </label>
					</div>
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
					{/if}
				</p>
			{/if}
		</form>
	{:else if data.surveyTaken}
		<p>You already did the survey. Thank you</p>
	{/if}
</article>
