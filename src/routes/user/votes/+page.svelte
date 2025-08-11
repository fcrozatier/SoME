<script lang="ts">
	import { enhance } from "$app/forms";
	import { PUBLIC_VOTE_START } from "$env/static/public";
	import { clickOutside, disableSubmitterAndSetValidity } from "$lib/actions";
	import Display from "$lib/components/Display.svelte";
	import LayoutSideBySide from "$lib/components/layouts/LayoutSideBySide.svelte";
	import Media from "$lib/components/Media.svelte";
	import Slider from "$lib/components/Slider.svelte";
	import Time from "$lib/components/Time.svelte";
	import { currentYear } from "$lib/config";
	import { makeTitle } from "$lib/utils/makeTitle";
	import { voteOpen } from "$lib/utils/time";
	import { FeedbackSchema } from "$lib/validation.js";
	import { round } from "@fcrozatier/ts-helpers";
	import * as fg from "formgator";

	let { data } = $props();

	const votesByYear = $derived(
		Object.groupBy(data.votes, (x) => new Date(x.created_at!).getFullYear()),
	);

	let currentVote: (typeof data)["votes"][0] | undefined = $state();
	let feedback = $state("");
	let grade: number | undefined = $state();
	let updateVote: HTMLDialogElement | undefined = $state();

	const closeUpdateDialog = () => {
		// reset the current vote to `undefined` to ensure the form elements are clean and verify the intended invariant when we open -> modify -> click outside -> reopen the dialog
		currentVote = undefined;
		grade = undefined;
		feedback = "";
		updateVote?.close();
	};
</script>

<svelte:head>
	<title>{makeTitle("My Votes")}</title>
</svelte:head>

<article class="layout-prose">
	<h2>My votes</h2>
	<p>Review all your votes. Update your feedback and scores during peer review</p>

	{#each Object.entries(votesByYear) as [year, votes]}
		<section class="mt-10">
			<h3>{year}</h3>
			{#each votes!.sort((v1, v2) => Number(v2.score) - Number(v1.score)) as vote}
				{@const created_at = vote.created_at!}
				{@const score = +vote.score}
				<div>
					<Media {...vote} thumbnailWidth="256px" gap={6}></Media>
					<LayoutSideBySide
						class="mt-8 flex-wrap-reverse! sm:flex-wrap!"
						side="right"
						mainPanelMinWidth="75%"
						sidePanelMaxWidth="64px"
					>
						{#snippet mainPanel()}
							<div>
								<b>Your feedback: </b>
								<div class="prose">{@html vote.feedback}</div>
							</div>
						{/snippet}
						{#snippet sidePanel()}
							<div class="flex items-center justify-end sm:flex-col text-xs flex-wrap gap-4">
								<div class="w-16 flex justify-center">
									<span
										class={`w-8 border text-xs rounded-full aspect-square min-w-4 text-center px-2 flex items-center justify-center
							${score <= 3 ? "bg-error/10 border-error" : ""}
							${score > 3 && score <= 7 ? "bg-warning/10 border-warning" : ""}
							${score > 7 ? "bg-success/10 border-success" : ""}
							`}
									>
										{round(score, 1)}
									</span>
								</div>
								{#if Number(year) === currentYear && voteOpen()}
									<button
										class="btn btn-sm"
										onclick={() => {
											currentVote = vote;
											feedback = vote.feedback_unsafe_md ?? "";
											grade = score;
											updateVote?.showModal();
										}}>update</button
									>
								{/if}
							</div>
						{/snippet}
					</LayoutSideBySide>
					<hr class="my-8!" />
				</div>
			{/each}
		</section>
	{:else}
		<p>No vote to display.</p>
		<p>
			The peer review starts on <strong><Time datetime={PUBLIC_VOTE_START} /></strong>.
		</p>
	{/each}
</article>

<dialog class="m-auto" bind:this={updateVote} closedby="none">
	<div use:clickOutside={closeUpdateDialog}>
		{#if currentVote && grade}
			<Display data={currentVote}></Display>
			<form
				method="post"
				action="?/update"
				use:enhance={disableSubmitterAndSetValidity({
					invalidateAll: true,
					toast: { success: "Vote updated!" },
					after: async ({ result }) => {
						if (result.type === "success") {
							closeUpdateDialog();
						}
					},
				})}
			>
				<input type="hidden" value={currentVote.uid} name="uid" />

				<div class="form-control gap-1">
					<h3 class="">Vote</h3>
					<h4 class="mb-0 mt-2">Ranking</h4>
					<p class="mb-4">
						How valuable is this entry to the space of online math exposition, compared to the
						typical math {currentVote.category === "video" ? "video" : "article"} you've seen?
					</p>

					<div class="my-12">
						<Slider ready={true} score={grade}></Slider>
					</div>
				</div>

				<div class="form-control">
					<label for="feedback" class="label flex gap-2">
						<h4 class="mb-0 mt-2">Feedback</h4>
					</label>
					<textarea
						id="feedback"
						name="feedback"
						class="block textarea-bordered textarea w-full"
						cols="50"
						rows="10"
						bind:value={feedback}
						{...fg.splat(FeedbackSchema.attributes)}
					></textarea>
					<div class="flex text-sm text-gray-500">
						<span>{feedback.length}/{FeedbackSchema.attributes.maxlength}</span>
					</div>
				</div>
				<div class="flex justify-between mt-12">
					<button class="btn btn-outline hover:btn-neutral" onclick={closeUpdateDialog}
						>Close</button
					>
					<button class="btn btn-neutral inline-flex gap-4">Update</button>
				</div>
			</form>
		{/if}
	</div>
</dialog>
