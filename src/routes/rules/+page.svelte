<script lang="ts">
	import {
		PUBLIC_REGISTRATION_END,
		PUBLIC_REGISTRATION_START,
		PUBLIC_RESULTS_AVAILABLE,
		PUBLIC_VOTE_END,
		PUBLIC_VOTE_START,
	} from "$env/static/public";
	import { FULL_NAME } from "$lib/config";
	import { phaseOpen, resultsAvailable, setTitle, voteOpen } from "$lib/utils";

	// let remaining = timeLeft();

	// let interval: NodeJS.Timeout | undefined;
	// onMount(() => {
	// 	interval = setInterval(() => {
	// 		remaining = timeLeft();
	// 	}, 1000);

	// 	return () => {
	// 		clearInterval(interval);
	// 	};
	// });

	const phases = [
		{
			title: "Join the competition as a participant or judge",
			description:
				'Participants all work on their projects and the <a href="https://discord.gg/WZvZMVsXXR" target="_blank">Discord</a> server allows creators to share partial progress, find collaborators and ask for help.',
			isOpen: phaseOpen(PUBLIC_REGISTRATION_START, PUBLIC_VOTE_END),
			dates: [PUBLIC_REGISTRATION_START, PUBLIC_REGISTRATION_END],
		},
		{
			title: "Vote for the best contributions",
			description:
				"Peer review! You'll be successively shown entries to review and optionally provide feedback. This is the heart of the event and in past years this phase has been what jump-started meaningful exposure for many entries.",
			isOpen: voteOpen(),
			dates: [PUBLIC_VOTE_START, PUBLIC_VOTE_END],
		},
		{
			title: "Results and feedback",
			description: "The top entries and the complete ranking are revealed.",
			isOpen: resultsAvailable(),
			dates: [PUBLIC_RESULTS_AVAILABLE],
		},
	];

	const dateFormat = {
		month: "short",
		day: "2-digit",
		hour: "numeric",
		minute: "numeric",
	} as const;

	setTitle("Rules");
</script>

<article class="layout-prose">
	<!-- Timeline -->
	<section class="layout-prose pb-4">
		<h2 class="mb-6 text-4xl font-black">Timeline</h2>
		<p>The competition has three phases:</p>
		<ul class="-ml-7 list-outside">
			{#each phases as phase, i}
				<li class={phase.isOpen ? "marker:text-green-500" : ""}>
					<div class="mb-4 mt-8">
						<span class="flex items-center gap-2 text-xl font-semibold">
							Phase {i + 1}:
							{phase.title}
							{#if phase.isOpen}
								<span class="badge badge-success">current</span>
							{/if}
						</span>
						<!-- <span class="text-sm text-gray-500"
							>{#if phase.dates.length > 1}
								From <Time datetime={phase.dates[0]} options={dateFormat} /> to
								<Time datetime={phase.dates[1]} options={dateFormat} />
							{:else}
								<Time datetime={phase.dates[0]} options={dateFormat} />
							{/if}</span
						> -->
					</div>

					<p class="text-sm">{@html phase.description}</p>
					{#if phase.isOpen}
						<p class="mt-6">
							{#if i === 0}
								<a class="btn-neutral btn" href="/register"
									>Join in <span class="ml-2 inline-block">&rarr;</span></a
								>
								<!-- {:else if i === 1}
								{#if data.token}
									<a class="btn-neutral btn" href="/vote/{data.token}">Vote</a>
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
								<a class="btn-neutral btn mr-4" href="/results">Results</a>
								{#if data.token}
									<a class="btn-neutral btn" href="/feedback/{data.token}">Your feedbacks</a>
								{/if} -->
							{/if}
						</p>
					{/if}
				</li>
			{/each}
		</ul>
	</section>

	<section id="rules" class="layout-prose pb-32">
		<h2 class="mb-16 text-4xl font-black">How does it work?</h2>

		<!-- Deadline -->
		<details>
			<summary>
				<div class="text-xl font-medium">When is the registration deadline?</div>
			</summary>
			<p>The competition is closed. Stay tuned for the next edition!</p>
			<!-- <p>
				Creators or group of Creators can submit an entry until <span class=""
					>August 18th at 11:59 PM (UTC-12)</span
				>.
			</p>
			<p>
				In your specific timezone (yes just yours) this deadline corresponds to <span
					class="font-mono font-semibold badge badge-outline p-4"
				>
					<Time datetime={PUBLIC_REGISTRATION_END} />
				</span>.
			</p>
			{#if registrationOpen()}
				<p>
					Which means you still have <span class="tabular-nums">{remaining.formatted}</span> left to
					submit an entry!
				</p>
			{/if}
			<p>
				If you want to participate as a judge you can register at any time, even after the vote has
				open.
			</p> -->
		</details>
		<!-- Not a creator -->
		<details>
			<summary>
				<div class="text-xl font-medium">I'm not a creator, can I participate?</div>
			</summary>
			<p>Sure, you can participate in the peer review phase by registering as a judge.</p>
			<p>
				You'll discover new Science content creators, will be able vote for the best ones and leave
				comments and advices for creators to learn from.
			</p>
		</details>
		<!-- Topic -->
		<details>
			<summary>
				<div class="text-xl font-medium">Is there a topic constraint?</div>
			</summary>
			<p>It has to be about math or something related.</p>
			<p>
				Here we mean &laquo; math &raquo; very broadly, and more applied topics like physics or
				computer science are abundantly welcome. It just has to be the case that a viewer/reader
				might come away knowing something mathematical they didn't before.
			</p>
			<p>
				The topic could be at any level, whether that's basic math for young children or
				higher-level math. If you're assuming a certain background level for the target audience,
				kindly mention it below.
			</p>
		</details>
		<!-- Software -->
		<details>
			<summary>
				<div class="text-xl font-medium">What software should I use?</div>
			</summary>
			<p>
				You can use any software you're familiar with, there's no constraint. You can even use no
				visualization software at all!
			</p>
			<p>
				What matters most is to find your own style, as this will make you stand out during the
				vote. And you'll have more fun making things your way.
			</p>
			<p>
				So feel no pressure to copy anyone's style, we'll enjoy your entry even more if it's
				original, so go have fun!
			</p>
		</details>
		<!-- How many entries -->
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
		<!-- Can I use old material? -->
		<details>
			<summary>
				<div class="text-xl font-medium">Can I use an old entry?</div>
			</summary>
			<p>It has to be something new you make this summer</p>
			<p>
				The spirit of this is to encourage people who've never put stuff online before. If you want
				to work on something you sort of started once before, that's probably fine, but it can't be
				something you already published before this contest. Optimally, you'd use this as a chance
				to try something new you otherwise might not have.
			</p>
		</details>
		<!-- Language -->
		<details>
			<summary>
				<div class="text-xl font-medium">Does it have to be in English?</div>
			</summary>
			<p>It has to be available in English: subtitles or translation are needed.</p>
			<p>
				If you want to put out an explainer in another language, wonderful! Please do! But the
				judges here will be English speakers, so to be considered for the contest the lesson has to
				be accessible to them.
			</p>
		</details>
		<!-- Copyright -->
		<details>
			<summary>
				<div class="text-xl font-medium">Can I use copyrighted material?</div>
			</summary>
			<p>By registering as a creator you agree to the following copyright notice:</p>
			<p class="indent-8 italic">
				I have permission to use all material contained in my submission for the {FULL_NAME}.
			</p>
			<ul>
				<li>
					<a href="/content-policy#fair-use">Copyrighted material policy and fair use guidelines</a>
				</li>
				<li><a href="/content-policy#cc">Creative Commons guidelines</a></li>
				<li><a href="/content-policy#ai">AI policy</a></li>
			</ul>
		</details>
		<!-- Winners -->
		<details>
			<summary>
				<div class="text-xl font-medium">How will winners be selected?</div>
			</summary>
			<p>
				This year's competition is run by the community, and as such, there will not be manual peer
				review nor prize money for winners as in previous editions.
			</p>
			<p>
				However the voting process will sift through the entries and give greater visibility to the
				better ones. The winning entries of this edition will be determined by the vote and will be
				revealed at the end of the competition.
			</p>
			<p>Here's what we're looking for:</p>
			<ul>
				<li>
					<b>Motivation:</b> It should be clear by the end of the introduction why one should care.
				</li>
				<li>
					<b> Clarity: </b>
					Jargon should be explained, the goals of the lesson should be understandable with minimal background,
					and the submission should generally display empathy for people unfamiliar with the topic.
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
			You can learn more about the algorithm and voting system we use&nbsp;<a href="/algorithm"
				>here</a
			>
		</details>
	</section>
</article>
