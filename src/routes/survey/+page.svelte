<script lang="ts">
	import { enhance } from "$app/forms";
	import { disableSubmitterAndSetValidity } from "$lib/actions";
	import { makeTitle } from "$lib/utils/makeTitle.js";
	import { SurveySchema } from "$lib/validation";
	import * as fg from "formgator";

	let { form } = $props();

	let someValue = $state(5);
	let siteValue = $state(5);
</script>

<svelte:head>
	<title>{makeTitle("Survey")}</title>
</svelte:head>

<article class="layout-prose">
	<h2>Survey</h2>

	<form
		method="post"
		use:enhance={disableSubmitterAndSetValidity({
			toast: { redirect: { type: "success", content: "Thank you! 🎉 🥳" } },
		})}
	>
		<h3>General</h3>
		<div class="space-y-8">
			<div>
				<label for="some" class="label">Event & Organization </label>
				<p class="mt-0 mb-0 text-sm">
					How satisfied are you with the SoME overall (<em>e.g.</em> communication, organization)?
				</p>
				<input
					id="some"
					name="some"
					type="range"
					step=".01"
					class="range range-sm w-full"
					bind:value={someValue}
					class:range-error={someValue <= 3}
					class:range-success={someValue > 7}
					class:range-warning={someValue > 3 && someValue <= 7}
					{...fg.splat(SurveySchema.some.attributes)}
				/>
				<div class="w-full flex justify-between text-xs px-1">
					{#each Array.from({ length: 9 }) as _, i}
						<button type="button" onclick={() => (someValue = i + 1)}>{i + 1}</button>
					{/each}
				</div>
				<div class="w-full flex justify-between text-xs px-1">
					<span>Not satisfied</span>
					<span>Very satisfied</span>
				</div>
			</div>
			<div>
				<label for="site" class="label">Website </label>
				<p class="mt-0 mb-0 text-sm">How satisfied are you with the Peer Review website?</p>
				<input
					id="site"
					name="site"
					type="range"
					step=".01"
					class="range range-sm w-full"
					bind:value={siteValue}
					class:range-error={siteValue <= 3}
					class:range-success={siteValue > 7}
					class:range-warning={siteValue > 3 && siteValue <= 7}
					{...fg.splat(SurveySchema.site.attributes)}
				/>
				<div class="w-full flex justify-between text-xs px-1">
					{#each Array.from({ length: 10 }) as _, i}
						<button type="button" onclick={() => (siteValue = i + 1)}>{i + 1}</button>
					{/each}
				</div>
				<div class="w-full flex justify-between text-xs px-1">
					<span>Not satisfied</span>
					<span>Very satisfied</span>
				</div>
			</div>
			<div>
				<label for="feedback" class="label">Future Improvements</label>
				<p class="mt-0 mb-1 text-sm">
					Do you have any general feedback or suggestions for how we could improve the Summer of
					Math Exposition next year?
				</p>
				<textarea
					id="feedback"
					name="feedback"
					class="textarea-bordered textarea text-base w-full"
					cols="50"
					rows="10"
					{...fg.splat(SurveySchema.feedback.attributes)}
				></textarea>
			</div>
		</div>

		<h3>Peer Review</h3>
		<div class="space-y-8">
			<div>
				<p class="mt-0 mb-1 text-sm">Did you participate in voting during the peer review?</p>
				<div class="flex gap-4">
					<label class="label">
						<input
							name="peer_review"
							type="radio"
							class="radio"
							value="yes"
							{...fg.splat(SurveySchema.peer_review.attributes)}
						/> Yes
					</label>
					<label class="label">
						<input
							name="peer_review"
							type="radio"
							class="radio"
							value="no"
							{...fg.splat(SurveySchema.peer_review.attributes)}
						/> No
					</label>
				</div>
			</div>
			<p class="mt-0 mb-1 text-sm">
				If not, why? When would be the most convenient time for the peer review (<em>e.g.</em> late August,
				early September, spanning both)?
			</p>
			<textarea
				name="peer_review_feedback"
				class="textarea-bordered textarea text-base w-full"
				cols="50"
				rows="10"
				{...fg.splat(SurveySchema.peer_review_feedback.attributes)}
			></textarea>
		</div>
		<h3>AI</h3>
		<div class="space-y-8">
			<div>
				<p class="mt-0 mb-1 text-sm">
					Would you like us to expand our AI policy to allow more AI-generated content?
				</p>
				<div class="flex gap-4">
					<label class="label">
						<input
							name="ai"
							type="radio"
							class="radio"
							value="yes"
							{...fg.splat(SurveySchema.ai.attributes)}
						/> Yes
					</label>
					<label class="label">
						<input
							name="ai"
							type="radio"
							class="radio"
							value="no"
							{...fg.splat(SurveySchema.ai.attributes)}
						/> No
					</label>
				</div>
			</div>
			<div>
				<p class="mt-0 mb-1 text-sm">
					If yes, in what form (<em>e.g.</em> thumbnails, voices, assets, editing, video content)?
					<br />
					If no, could you share your concerns?
				</p>
				<textarea
					name="ai_feedback"
					class="textarea-bordered textarea text-base w-full"
					cols="50"
					rows="10"
					{...fg.splat(SurveySchema.ai_feedback.attributes)}
				></textarea>
			</div>
		</div>
		<h3>Creators</h3>
		<p>This section is mainly for creators, feel free to skip it if you didn't submit an entry</p>
		<div class="space-y-8">
			<div>
				<p class="mt-0 mb-1 text-sm">
					Would you prefer to see your feedback, scores and comments immediately (live) or only
					after the peer review ends?
				</p>
				<div class="flex gap-4">
					<label class="label">
						<input
							name="creator_live_feedback"
							type="radio"
							class="radio"
							value="live"
							{...fg.splat(SurveySchema.creator_live_feedback.attributes)}
						/> Live
					</label>
					<label class="label">
						<input
							name="creator_live_feedback"
							type="radio"
							class="radio"
							value="after"
							{...fg.splat(SurveySchema.creator_live_feedback.attributes)}
						/> After peer review
					</label>
				</div>
			</div>
			<div>
				<p class="mt-0 mb-1 text-sm">
					We're considering providing you a direct voting link you could share (on your site,
					YouTube description, or elsewhere). This link would be available as soon as submissions
					open, allowing early votes on your entry before peer-review. After voting reviewers would
					be directed to other entries, similar to the peer review process. This would bring in more
					people, and increase the total number of votes. What do you think about this feature?
				</p>
				<textarea
					name="creator_sharable_vote_link"
					class="textarea-bordered textarea text-base w-full"
					cols="50"
					rows="10"
					{...fg.splat(SurveySchema.creator_sharable_vote_link.attributes)}
				></textarea>
			</div>
		</div>
		<h3>Accessibility</h3>
		<div class="space-y-8">
			<div>
				<p class="mt-0 mb-1 text-sm">
					Do you have any disability (<em>e.g.</em> low vision, color blindness, mobility impairment)?
				</p>
				<div class="flex gap-4">
					<label class="label">
						<input
							name="a11y"
							type="radio"
							class="radio"
							value="yes"
							{...fg.splat(SurveySchema.a11y.attributes)}
						/> Yes
					</label>
					<label class="label">
						<input
							name="a11y"
							type="radio"
							class="radio"
							value="no"
							{...fg.splat(SurveySchema.a11y.attributes)}
						/> No
					</label>
				</div>
			</div>
			<div>
				<p class="mt-0 mb-1 text-sm">If yes, how could we make the site more accessible for you?</p>
				<textarea
					name="a11y_feedback"
					class="textarea-bordered textarea text-base w-full"
					cols="50"
					rows="10"
					{...fg.splat(SurveySchema.a11y_feedback.attributes)}
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
