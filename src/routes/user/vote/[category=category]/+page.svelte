<script lang="ts">
	import { enhance } from "$app/forms";
	import * as fg from "formgator";
	import { afterNavigate, goto } from "$app/navigation";
	import { page } from "$app/state";
	import { clickOutside } from "$lib/actions";
	import Display from "$lib/components/Display.svelte";
	import NewVote from "$lib/components/NewVote.svelte";
	import Slider from "$lib/components/Slider.svelte";
	import { newToast } from "$lib/components/Toasts.svelte";
	import { onMount } from "svelte";
	import { formAction } from "./config";
	import { setTitle } from "$lib/utils/setTitle";
	import { FeedbackSchema, FlagSchema } from "$lib/validation";

	let { data, form } = $props();

	let flagDialog: HTMLDialogElement | undefined = $state();
	let guidelines: HTMLDialogElement | undefined = $state();
	let splitButtonOpen = $state(false);

	let score = $state(5);
	let ready = $state(false);
	let feedback = $state("");

	let targetTime: number;
	let cooldown = $state(590);
	let interval: ReturnType<typeof setInterval> | undefined = $state();

	const visibilitychange = () => {
		if (document.visibilityState === "visible") {
			cooldown = Math.round((targetTime - Date.now()) / 100);
		}
	};

	onMount(() => {
		targetTime = Date.now() + 59 * 1000;
		document.addEventListener("visibilitychange", visibilitychange);

		return () => {
			document.removeEventListener("visibilitychange", visibilitychange);
		};
	});

	afterNavigate(() => {
		splitButtonOpen = false;
		ready = false;
		targetTime = Date.now() + 59 * 1000;
		cooldown = 590;
		interval = setInterval(() => {
			if (cooldown > 0) {
				cooldown -= 1;
			} else {
				clearInterval(interval);
			}
		}, 100);
	});

	export const snapshot = {
		capture: () => {
			return {
				score,
				feedback,
			};
		},
		restore: (v) => {
			score = v.score;
			feedback = v.feedback;
		},
	};

	setTitle("Vote");
</script>

<article class="layout-prose">
	{#if data.stopVote}
		<div>
			<p class="text-success">Thank you for participating!</p>

			<NewVote displayCategories="others-only" />
		</div>
	{:else}
		<Display {data}></Display>
		<form
			method="post"
			action="?/vote"
			class="space-y-4"
			use:enhance={({ cancel, action }) => {
				if (
					cooldown > 0 &&
					!(action.search === formAction("skip") || action.search === formAction("hard_skip"))
				) {
					newToast({ type: "error", content: "Please do not rush the review process" });
					return cancel();
				}
				if (
					!ready &&
					!(action.search === formAction("skip") || action.search === formAction("hard_skip"))
				) {
					newToast({ type: "info", content: "Please do not forget to grade the entry" });
					return cancel();
				}
				const buttons = document.querySelectorAll("button");
				buttons.forEach((b) => b.setAttribute("disabled", "on"));

				return async ({ action }) => {
					buttons.forEach((b) => b.removeAttribute("disabled"));
					if (action.search === formAction("skip") || action.search === formAction("hard_skip")) {
						const message = `Entry skipped${
							action.search === formAction("hard_skip") ? " (you won't see it again)" : ""
						}`;

						newToast({ type: "info", content: message });
					} else {
						newToast({ type: "success", content: "Thank you! 🎉 🥳" });
					}

					clearInterval(interval);
					feedback = "";
					score = 5;

					// Like update but scrolls to top
					await goto(`/user/vote/${page.params["category"]}`, {
						noScroll: false,
						invalidateAll: true,
					});
				};
			}}
		>
			<input type="hidden" value={data.uid} name="uid" />
			<div class="form-control gap-1">
				<h3 class="">Vote</h3>
				<h4 class="mb-0 mt-2">Ranking</h4>
				<p class="mb-4">
					How valuable is this entry to the space of online math exposition, compared to the typical
					math {data.category === "video" ? "video" : "article"} you've seen?
					<button
						class="font-semibold hover:underline cursor-pointer"
						type="button"
						commandfor="guidelines"
						command="show-modal"
						onclick={() => {
							guidelines?.showModal();
							guidelines?.scrollTo({ top: 0 });
						}}>Guidelines*</button
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
					bind:ready
				></Slider>
			</div>

			<div class="form-control">
				<label for="feedback" class="label flex gap-2">
					<h4 class="mb-0 mt-2">Feedback</h4>
				</label>
				<p class="flex-1 mt-2">
					What worked well? What could be improved? Be <strong>constructive</strong> and
					<strong>specific</strong>.<br /> Suggest one actionable improvement. For inspiration, you
					can pick ideas from the
					<button
						class="font-semibold hover:underline cursor-pointer"
						type="button"
						commandfor="guidelines"
						command="show-modal"
						onclick={() => {
							guidelines?.showModal();
							guidelines?.scrollTo({ top: 0 });
						}}>Guidelines*</button
					>
				</p>
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
					<span>{feedback?.length}/{FeedbackSchema.attributes.maxlength}</span>
				</div>
			</div>
			<div class="flex gap-4 items-center flex-row-reverse">
				<button class="btn btn-neutral inline-flex gap-4"
					>Vote
					{#if cooldown > 0}
						<div
							class="radial-progress text-sm"
							style={`--value:${(100 * cooldown) / 600}; --size:2.1rem; --thickness: 1.5px;`}
						>
							{Math.floor(cooldown / 10)}
						</div>
					{/if}
				</button>
				<div class="relative mr-auto inline-flex flex-row-reverse">
					<button
						class="btn btn-outline hover:btn-neutral rounded-l-none border-l-0 text-lg shrink-0"
						type="button"
						aria-expanded={splitButtonOpen}
						aria-haspopup="true"
						title="Open for more skip actions"
						onclick={() => {
							if (!splitButtonOpen) splitButtonOpen = true;
						}}>&vellip;</button
					>
					{#if splitButtonOpen}
						<button
							use:clickOutside={() => {
								if (splitButtonOpen) splitButtonOpen = false;
							}}
							type="submit"
							formaction={"?/hard_skip"}
							class="btn btn-neutral text-xs bg-black absolute left-0 px-2 top-[105%]"
							>Don't show again</button
						>
					{/if}
					<button
						type="submit"
						formaction={"?/skip"}
						class="btn btn-outline rounded-e-none hover:btn-neutral">Skip</button
					>
				</div>
				<button
					type="button"
					class="btn btn-outline btn-error"
					commandfor="flag"
					command="show-modal"
					onclick={() => flagDialog?.showModal()}>Flag</button
				>
			</div>
			{#if form?.voteFail || form?.skipFail}
				<p class="text-error">
					<span> Something went wrong. </span>
					<span> Please try again later</span>
				</p>
			{/if}
		</form>

		<p class="pt-8 text-sm">
			If an entry is inappropriate or does not follow the <a href="/rules">rules</a> you can flag it
			and we will review it manually. <br /> You can also skip an entry
		</p>
	{/if}
</article>

<dialog id="guidelines" class="m-auto" bind:this={guidelines} closedby="any">
	<article use:clickOutside={() => guidelines?.close()}>
		<h2 id="guidlines" class="text-center mt-0 mb-8">Guidelines</h2>

		<p>When scoring an entry you might consider the following principles:</p>

		<h3>Motivation</h3>
		<p>Is it clear by the end of the introduction why one should care for the topic?</p>

		<h3>Clarity</h3>
		<p>
			Would the explanations make sense for the target audience? Jargon should be explained, the
			goals of the lesson should be understandable with minimal background, and the submission
			should generally display empathy for people unfamiliar with the topic.
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
			change in perspective, the beauty of an explanation, or the mind-blowingness of an aha moment.
		</p>

		<p class="flex justify-end mt-8 mb-2">
			<button
				type="button"
				class="btn-outline btn hover:btn-neutral"
				commandfor="guidelines"
				command="request-close"
				onclick={() => guidelines?.close()}>Close</button
			>
		</p>
	</article>
</dialog>

<dialog id="flag" class="m-auto" bind:this={flagDialog} closedby="any">
	<form
		method="post"
		class="space-y-2"
		action="?/flag"
		use:clickOutside={() => flagDialog?.close()}
		use:enhance={({ formElement }) => {
			const buttons = document.querySelectorAll("button");
			buttons.forEach((b) => b.setAttribute("disabled", "on"));
			return async () => {
				buttons.forEach((b) => b.removeAttribute("disabled"));
				formElement.reset();
				flagDialog?.close();
				clearInterval(interval);
				newToast({ type: "info", content: "Entry flagged" });
				await goto(`/user/vote/${page.params["category"]}`, {
					noScroll: false,
					invalidateAll: true,
				});
			};
		}}
	>
		<h2 class="mt-0">Report this entry</h2>
		<p class="text-gray-700 mb-0">You can report an entry if it:</p>
		<ul class="mt-0 *:space-y-0">
			<li>Contains inappropriate content</li>
			<li>Violates the competition <a href="/rules" target="_blank">rules</a></li>
		</ul>
		<p>The following entry will be reviewed by the SoME team:</p>
		<p><strong>{data.title}</strong></p>

		<label for="reason" class="label">Reason for reporting:</label>
		<input
			id="reason"
			type="text"
			name="reason"
			class="input-bordered input w-full"
			placeholder="Briefly explain why this entry should be reviewed"
			{...fg.splat(FlagSchema["reason"].attributes)}
		/>
		<input type="hidden" value={data.uid} name="uid" required />
		<p class="mb-0 mt-8 flex items-center gap-2">
			<button
				type="button"
				class="btn-outline btn"
				commandfor="flag"
				command="request-close"
				onclick={() => flagDialog?.close()}>Cancel</button
			>
			<button type="submit" class="btn-outline btn-error btn">Report </button>
			{#if form?.id === "FLAG" && form?.flagFail}
				<span class="text-error">Something went wrong.</span>
			{/if}
		</p>
	</form>
</dialog>
