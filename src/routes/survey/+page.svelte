<script lang="ts">
	import { enhance } from "$app/forms";
	import { disableSubmitterAndSetValidity } from "$lib/actions";
	import { formatTitle } from "$lib/utils/formatting.js";
	import { SurveySchema } from "$lib/validation";
	import * as fg from "formgator";

	let { form } = $props();
</script>

<svelte:head>
	<title>{formatTitle("Survey")}</title>
</svelte:head>

<article class="layout-prose">
	<h2>Survey</h2>

	<form
		method="post"
		use:enhance={disableSubmitterAndSetValidity({
			toast: { redirect: { type: "success", content: "Thank you! 🎉" } },
		})}
	>
		<h3>General Feedback</h3>
		<div class="space-y-8">
			<div>
				<label for="feedback" class="label">Suggestions & Improvements</label>
				<p class="mt-0 mb-1 text-sm">
					Do you have any general feedback or suggestions for how we could improve the Summer of
					Math Exposition next year? (features, rule clarifications etc.)
				</p>
				<textarea
					id="feedback"
					name="feedback"
					class="textarea-bordered textarea text-base w-full min-h-[10lh]"
					cols="50"
					{...fg.splat(SurveySchema.feedback.attributes)}
				></textarea>
			</div>
		</div>

		<h3>Community Prizes</h3>
		<p>
			Potential new feature: letting people donate cash money directly to SoME creators from the
			website.
		</p>
		<div class="space-y-8">
			<div>
				<p class="mt-0 mb-1 text-sm">
					Would you be interested in donating to SoME creators directly from the site?
				</p>
				<div class="flex gap-4">
					<label class="label">
						<input
							name="community_prizes_interest"
							type="radio"
							class="radio"
							value="yes"
							{...fg.splat(SurveySchema.community_prizes_interest.attributes)}
						/> Yes
					</label>
					<label class="label">
						<input
							name="community_prizes_interest"
							type="radio"
							class="radio"
							value="no"
							{...fg.splat(SurveySchema.community_prizes_interest.attributes)}
						/> No
					</label>
				</div>
			</div>
			<div>
				<p class="mt-0 mb-1 text-sm">
					What would be the typical amount you would consider donating to a creator?
				</p>
				<div class="flex gap-2 items-center">
					<input
						name="community_prizes_amount"
						type="number"
						class="input text-right"
						{...fg.splat(SurveySchema.community_prizes_amount.attributes)}
					/> $
				</div>
			</div>
			<div>
				<p class="mt-0 mb-1 text-sm">What do you think of this feature?</p>
				<textarea
					name="community_prizes_feedback"
					class="textarea-bordered textarea text-base w-full min-h-[10lh]"
					cols="50"
					{...fg.splat(SurveySchema.community_prizes_feedback.attributes)}
				></textarea>
			</div>
		</div>
		<h3>Topical SoME</h3>
		<div class="space-y-8">
			<div>
				<p class="mt-0 mb-1 text-sm">
					What do you think about having SoME with a twist like a "constraint of the year",
					something like a constraint on the format or duration or topic? We could have "only 10min
					entries" a certain year, "only algebra" another etc.
				</p>
				<textarea
					name="topical_feedback"
					class="textarea-bordered textarea text-base w-full min-h-[10lh]"
					cols="50"
					{...fg.splat(SurveySchema.topical_feedback.attributes)}
				></textarea>
			</div>
		</div>
		<p>
			<button class="btn btn-neutral">Submit survey</button>
		</p>
		{#if form?.issues}
			<p>Something went wrong:</p>
			<ul>
				{#each Object.entries(form.issues) as [k, issue]}
					<li class="text-error">{k}: {issue}</li>
				{/each}
			</ul>
		{/if}
	</form>
</article>
