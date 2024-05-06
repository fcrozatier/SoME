<script lang="ts">
	import { resultsAvailable, competitionStarted, voteOpen, phaseOpen, timeLeft } from '$lib/utils';
	import Time from '$lib/components/Time.svelte';
	import type { ActionData, PageData } from './$types';
	import { clickOutside } from '$lib/actions';
	import { enhance } from '$app/forms';
	import { COMPETITION_FULL_NAME, COMPETITION_SHORT_NAME } from '$lib/config';
	import {
		PUBLIC_REGISTRATION_END,
		PUBLIC_REGISTRATION_START,
		PUBLIC_RESULTS_AVAILABLE,
		PUBLIC_VOTE_END,
		PUBLIC_VOTE_START
	} from '$env/static/public';
	import Icon from '../lib/components/Icon.svelte';
	import { winners } from '$lib/results';
	import { onMount } from 'svelte';

	const phases = [
		{
			title: 'Join the competition as a participant or judge',
			description:
				'Participants all work on their projects. You can join the <a href="https://discord.gg/WZvZMVsXXR" target="_blank">Discord</a>, to share partial progress, find collaborators etc.',
			isOpen: phaseOpen(PUBLIC_REGISTRATION_START, PUBLIC_VOTE_END),
			dates: [PUBLIC_REGISTRATION_START, PUBLIC_REGISTRATION_END]
		},
		{
			title: 'Vote for the best contributions',
			description:
				"Peer review! Everyone, whether or not they've submitted an entry, can participate. You'll be successively shown entries to review and optionally provide feedback (it's actually a ton of fun). In many ways, this is the heart of the event, and in past years this phase has been what jump-started meaningful exposure for many entries.",
			isOpen: voteOpen(),
			dates: [PUBLIC_VOTE_START, PUBLIC_VOTE_END]
		},
		{
			title: 'Results and feedback',
			description: 'The top entries are revealed and the complete list of entries is published.',
			isOpen: resultsAvailable(),
			dates: [PUBLIC_RESULTS_AVAILABLE]
		}
	];

	const dateFormat = {
		month: 'short',
		day: '2-digit',
		hour: 'numeric',
		minute: 'numeric'
	} as const;

	export let data: PageData;
	export let form: ActionData;

	let personalLinkDialog: HTMLDialogElement;
	let email: string;

	function closeDialog() {
		personalLinkDialog.close();
		if (form) {
			form.emailInvalid = undefined;
			form.error = undefined;
			form.success = undefined;
		}
	}

	let remaining = timeLeft();

	let interval: NodeJS.Timeout | undefined;
	onMount(() => {
		interval = setInterval(() => {
			remaining = timeLeft();
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<svelte:head>
	<title>{COMPETITION_SHORT_NAME}</title>
</svelte:head>

<section class="layout-prose pb-4">
	<p class=" mb-16 text-center text-3xl font-light">Discover and create new math content.</p>
	<p>
		The {COMPETITION_FULL_NAME} ({COMPETITION_SHORT_NAME}) is an annual competition to foster the
		creation of excellent math content online. You can participate as either a creator or judge.
		<a href="#rules">Learn more</a>
	</p>
</section>

<section class="layout-prose pb-4">
	<h2 class="mb-6 text-4xl font-black">Timeline</h2>
	<p>The competition has three phases:</p>
	<ul class="-ml-7 list-outside">
		{#each phases as phase, i}
			<li class={phase.isOpen ? 'marker:text-green-500' : ''}>
				<div class="mb-4 mt-8">
					<span class="flex items-center gap-2 text-xl font-semibold">
						Phase {i + 1}:
						{phase.title}
						{#if phase.isOpen}
							<span class="badge badge-success">current</span>
						{/if}
					</span>
					<span class="text-sm text-gray-500"
						>{#if phase.dates.length > 1}
							From <Time datetime={phase.dates[0]} options={dateFormat} /> to
							<Time datetime={phase.dates[1]} options={dateFormat} />
						{:else}
							Before <Time datetime={phase.dates[0]} options={dateFormat} />
						{/if}</span
					>
				</div>

				<p class="text-sm">{@html phase.description}</p>
				{#if phase.isOpen}
					<p class="mt-6">
						{#if i === 0}
							<a class="btn-primary btn" href="/register"
								>Join in <span class="ml-2 inline-block">&rarr;</span></a
							>
						{:else if i === 1}
							{#if data.token}
								<a class="btn-primary btn" href="/vote/{data.token}">Vote</a>
							{:else}
								<button
									type="button"
									class="btn-outline btn"
									on:click={() => {
										personalLinkDialog.showModal();
									}}
									>Resend me my personal link
								</button>
							{/if}
						{:else if i === 2}
							<a class="btn-primary btn" href="/feedback/{data.token}">See feedbacks</a>
						{/if}
					</p>
				{/if}
			</li>
		{/each}
	</ul>

	{#if !competitionStarted()}
		{#if !PUBLIC_REGISTRATION_START}
			<p>The competition has not started yet.</p>
			<p>Stay tuned for the announcement of phase 1!</p>
		{/if}
	{/if}
</section>

<section id="rules" class="layout-prose pb-32">
	<h2 class="mb-16 text-4xl font-black">How does it work?</h2>

	<details>
		<summary>
			<div class="text-xl font-medium">When is the registration deadline?</div>
		</summary>
		<p>
			Creators or group of Creators can submit an entry until August 18th <a
				href="https://en.wikipedia.org/wiki/Anywhere_on_Earth"
				target="_blank">Anywhere on Earth</a
			>. In your specific timezone (yes just yours) this deadline corresponds to <Time
				datetime={PUBLIC_REGISTRATION_END}
			/>.
		</p>
		<p>Which means you still have {remaining.formatted} left to submit an entry!</p>
		<p>
			If you want to participate as a judge you can register at any time, even after the vote has
			open.
		</p>
	</details>
	<details>
		<summary>
			<div class="text-xl font-medium">Is there a topic constraint?</div>
		</summary>
		<p>It has to be about math.</p>
		<p>
			Here we mean &laquo; math &raquo; very broadly, and more applied topics like physics or
			computer science are abundantly welcome. It just has to be the case that a viewer/reader might
			come away knowing something mathematical they didn't before.
		</p>
		<p>
			The topic could be at any level, whether that's basic math for young children or higher-level
			math. If you're assuming a certain background level for the target audience, kindly mention it
			below.
		</p>
	</details>
	<details>
		<summary>
			<div class="text-xl font-medium">How many entries can I submit?</div>
		</summary>
		<p>One entry per person / group</p>
		<p>
			We hope you make more, but we only have the capacity to judge participants based on a single
			entry.
		</p>
	</details>
	<details>
		<summary>
			<div class="text-xl font-medium">Can I use an old entry?</div>
		</summary>
		<p>It has to be something new you make this summer</p>
		<p>
			The spirit of this is to encourage people who've never put stuff online before. If you want to
			work on something you sort of started once before, that's probably fine, but it can't be
			something you already published before this contest. Optimally, you'd use this as a chance to
			try something new you otherwise might not have.
		</p>
	</details>
	<details>
		<summary>
			<div class="text-xl font-medium">Does it have to be in English?</div>
		</summary>
		<p>It has to be available in English: subtitles or translation are needed.</p>
		<p>
			If you want to put out an explainer in another language, wonderful! Please do! But the judges
			here will be English speakers, so to be considered for the contest the lesson has to be
			accessible to them.
		</p>
	</details>
	<details>
		<summary>
			<div class="text-xl font-medium">Can I use copyrighted material?</div>
		</summary>
		<p>By registering as a creator you agree to the following copyright notice:</p>
		<p class="indent-8 italic">
			I have permission to use all material contained in my submission for the {COMPETITION_FULL_NAME}.
		</p>
		<ul>
			<li>
				<a href="/content-policy#fair-use">Copyrighted material policy and fair use guidelines</a>
			</li>
			<li><a href="/content-policy#cc">Creative Commons guidelines</a></li>
			<li><a href="/content-policy#ai">AI policy</a></li>
		</ul>
	</details>
	<details>
		<summary>
			<div class="text-xl font-medium">How will winners be selected?</div>
		</summary>
		<p>Here's what we're looking for:</p>
		<ul>
			<li>
				<b> Clarity: </b>
				Jargon should be explained, the goals of the lesson should be understandable with minimal background,
				and the submission should generally display empathy for people unfamiliar with the topic.
			</li>
			<li>
				<b>Motivation:</b> It should be clear to the reader/viewer within the first 30 seconds why they
				should care.
			</li>
			<li>
				<b>Novelty:</b> It doesn't necessarily have to be an original idea or original topic, but it
				should offer someone an experience they might otherwise not have by searching around online.
				Some of the greatest value comes from covering common topics in better ways. Other times there's
				value in surfacing otherwise obscure ideas which more people should know about.
			</li>
			<li>
				<b>Memorability:</b> Something should make the piece easy to remember even several months later.
				Maybe it's the beauty of the presentation, the enthusiasm of the presenter, or the mind-blowingness
				of an aha moment.
			</li>
		</ul>
		<p>The peer review process will help filter the better entries.</p>
	</details>
</section>

<section class="text-ligh bg-black/95 pb-32 pt-24 text-center" style:color="var(--light-gold)">
	<div class="mx-auto max-w-prose">
		<h2 class="my-0 text-5xl font-black" style:color="var(--light-gold)">
			Last year's competition
		</h2>
		<p class="mt-8 font-light tracking-wider">
			Discover the 5 winners of the last edition. <br />

			The 20 honorable mentions as well as the full list of entries is available
			<a class="font-light" style:color="var(--light-gold)" href="/previous">here</a>
		</p>
	</div>
	<div class="mx-4">
		<div
			class="scrollbar mx-auto flex max-w-5xl snap-x snap-proximity snap-always items-center gap-10 overflow-x-scroll pb-2"
			style:--scrollbar-thumb="var(--light-gold)"
		>
			{#each winners as winner}
				<div class="snap-center">
					{#if winner.video}
						<iframe
							width="420"
							class="aspect-video rounded-lg"
							src={winner.link}
							title="YouTube video player"
							frameborder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
							allowfullscreen
							loading="lazy"
						/>
					{:else}
						<a href={winner.link} target="_blank" class="inline-block w-[420px]">
							<img
								src={winner.thumbnail}
								alt="Winner thumbnail"
								width="420"
								class="aspect-video rounded-lg"
								loading="lazy"
							/>
						</a>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>

<section class="mt-10 pt-10">
	<h2 class="text-center text-2xl font-light">
		Operations for this contest have been generously funded by
	</h2>
	<div class="flex justify-center">
		<a href="https://www.janestreet.com/" target="_blank">
			<Icon class="opacity-10" name="janeStreet" width="18rem" height="5rem" />
		</a>
	</div>
</section>

<dialog class="mb-auto" bind:this={personalLinkDialog}>
	<form
		class=""
		method="post"
		action="?/resend_link"
		use:clickOutside={closeDialog}
		use:enhance={({ submitter }) => {
			submitter?.setAttribute('disabled', 'on');
			return async ({ update }) => {
				await update();
				submitter?.removeAttribute('disabled');
			};
		}}
	>
		<h2 class="mt-0">Personal link</h2>
		<p>You will receive an email with your personal link.</p>
		<label for="email" class="label inline-flex gap-4"
			>Email <small class="font-light text-gray-700">(the one you registered with)</small></label
		>
		<input
			id="email"
			type="email"
			name="email"
			placeholder="john@gmail.com"
			class="input-bordered input w-full max-w-xs"
			bind:value={email}
			required
		/>

		<p class="flex gap-4">
			<button type="button" class="btn-outline btn" on:click={closeDialog}>Close</button>
			<button type="submit" class="btn-primary btn">Send email</button>
		</p>
		{#if form?.error || form?.emailInvalid}
			<span class="text-error">Something went wrong.</span>
		{:else if form?.success}
			<span class="text-success">Email sent!</span>
		{/if}
	</form>
</dialog>
