<script lang="ts">
	import { enhance } from "$app/forms";
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

	let { data, form } = $props();

	let flagDialog: HTMLDialogElement | undefined = $state();
	let guidelines: HTMLDialogElement | undefined = $state();
	let actionScreen: HTMLDialogElement | undefined = $state();
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

		if (
			!data.stopVote &&
			!page.url.searchParams.get("screen") &&
			data.total_votes &&
			data.total_votes > 0 &&
			data.total_votes % 5 === 0
		) {
			actionScreen?.showModal();
		}
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
					newToast({ type: "info", content: "Please do not rush the review process" });
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
					await goto(`/vote/${page.params["token"]}/${page.params["category"]}`, {
						noScroll: false,
						invalidateAll: true,
					});
				};
			}}
		>
			<input type="hidden" value={data.uid} name="uid" />
			<input type="hidden" value={data.tag} name="tag" />
			<div class="form-control gap-1">
				<h3 class="mb-0">Vote</h3>
				<p class="mb-4">
					How valuable is this entry to the space of online math exposition, compared to the typical
					math {data.category === "video" ? "video" : "article"} you've seen?
					<button
						class="font-semibold hover:underline text-sm"
						type="button"
						onclick={() => {
							guidelines?.showModal();
							guidelines?.scrollTo({ top: 0 });
						}}>(Guidelines*)</button
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
				<h4 class="mb-0 mt-2">Feedback</h4>
				<label for="feedback" class="label flex gap-2">
					<span class="flex-1">
						Do you have general feedback for the author of this entry? If so, please be as
						constructive as possible in your comments:
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
					<span class="label-text-alt">{feedback?.length}/5000</span>
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
						class="btn btn-outline rounded-l-none border-l-0 text-lg shrink-0"
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
							formaction={formAction("hard_skip")}
							class="btn btn-neutral text-xs bg-black absolute left-0 px-2 top-[105%]"
							>Don't show again</button
						>
					{/if}
					<button
						type="submit"
						formaction={formAction("skip")}
						class="btn btn-outline rounded-e-none">Skip</button
					>
				</div>
				<button
					type="button"
					class="btn btn-outline btn-error"
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

		<p class="pt-8">
			If an entry is inappropriate or does not follow the <a href="/rules">rules</a> you can flag it
			and we will review it manually. You can also skip an entry in case you can't rank it (maybe you
			do not have the prerequisites)
		</p>
	{/if}
</article>

<dialog class="" bind:this={guidelines} closedby="any">
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

		<p class="text-center mt-8 mb-2">
			<button type="button" class="btn-outline btn" onclick={() => guidelines?.close()}
				>Close</button
			>
		</p>
	</article>
</dialog>

<dialog class="" bind:this={flagDialog} closedby="any">
	<form
		method="post"
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
				await goto(`/vote/${page.params["token"]}/${page.params["category"]}`, {
					noScroll: false,
					invalidateAll: true,
				});
			};
		}}
	>
		<h2 class="mt-0">What's wrong with this entry?</h2>
		<p class="text-gray-700">You can report an entry if:</p>
		<ul>
			<li>it is inappropriate / suspicious</li>
			<li>it does not respect the rules</li>
			<li>you cannot proceed (wrong platform etc.)</li>
		</ul>
		<p>In any case please provide a reason. The entry will be reviewed by admins.</p>
		<span class="capitalize font-semibold">{data.title}</span>
		<label for="reason" class="label">Reason</label>
		<input
			id="reason"
			type="text"
			name="reason"
			maxlength="100"
			class="input-bordered input w-full"
			required
		/>
		<input type="hidden" value={data.uid} name="uid" />
		<input type="hidden" value={data.tag} name="tag" />
		<p class="mb-0 mt-8 flex items-center gap-2">
			<button type="button" class="btn-outline btn" onclick={() => flagDialog?.close()}
				>Cancel</button
			>
			<button type="submit" class="btn-outline btn-error btn">Report </button>
			{#if form?.id === "FLAG" && form?.flagFail}
				<span class="text-error">Something went wrong.</span>
			{/if}
		</p>
	</form>
</dialog>

<dialog class="mb-auto" bind:this={actionScreen} closedby="none">
	<form class="max-w-(--breakpoint-sm)" method="dialog">
		<h2 class="mt-0">You've made {data.total_votes} votes!</h2>
		<p class="text-success">Thank you.</p>
		<p class="">You can continue voting, change category or take a break at any time</p>
		<NewVote />
	</form>
</dialog>
