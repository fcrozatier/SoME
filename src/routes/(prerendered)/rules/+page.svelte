<script lang="ts">
	import { PUBLIC_REGISTRATION_END } from "$env/static/public";
	import Time from "$lib/components/Time.svelte";
	import { FULL_NAME } from "$lib/config";
	import { makeTitle } from "$lib/utils/makeTitle";
	import { submissionsOpen, timeLeft } from "$lib/utils/time";
	import { onMount } from "svelte";

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
	<title>{makeTitle("Rules")}</title>
</svelte:head>

<article class="layout-prose">
	<section id="rules" class="layout-prose pb-32">
		<h2 class="mb-16 text-4xl font-black">How does it work?</h2>

		<!-- Age -->
		<details>
			<summary id="minimum-age"
				><a href="/rules#minimum-age">Is there a minimum age to participate?</a></summary
			>
			<p>You must be at least 13 years old to create an account on the SoME platform.</p>
			<p>
				For creators under 18, participation implies you have obtained parental or guardian consent.
			</p>
			<p>
				If you are under 18 and win prize money, disbursement of funds may require parental
				involvement, in compliance with applicable laws.
			</p>
		</details>
		<!-- Deadline -->
		<details>
			<summary id="deadline"><a href="/rules#deadline">When is the submission deadline?</a></summary
			>
			<!-- <p>The competition is closed. Stay tuned for the next edition!</p> -->
			<p>
				Creators or group of Creators can submit an entry until <span class=""
					>September 1st at 11:59 PM (UTC-12)</span
				>.
			</p>
			<p>
				In your specific timezone (yes just yours) this deadline corresponds to <span
					class="font-mono font-semibold badge badge-outline p-4"
				>
					<Time datetime={PUBLIC_REGISTRATION_END} />
				</span>.
			</p>
			{#if submissionsOpen()}
				<p>
					Which means you still have <span class="tabular-nums">{remaining.formatted}</span> left to
					submit an entry!
				</p>
			{/if}
			<p>
				If you want to participate as a judge you can register at any time, even after the vote has
				open.
			</p>
		</details>
		<!-- Not a creator -->
		<details>
			<summary id="non-creators-are-welcome"
				><a href="/rules#non-creators-are-welcome"
					>I'm not a creator, can I participate?
				</a></summary
			>
			<p>Sure, you can participate in the peer review phase by registering as a judge.</p>
			<p>
				You'll discover new Science content creators, will be able vote for the best ones and leave
				comments and advices for creators to learn from.
			</p>
		</details>
		<!-- Topic -->
		<details>
			<summary id="topic-constraint"
				><a href="/rules#topic-constraint">Is there a topic constraint? </a></summary
			>
			<p>It has to be about math or something related.</p>
			<p>
				Here we mean &laquo; math &raquo; very broadly, and more applied topics like physics or
				computer science are abundantly welcome. It just has to be the case that a viewer/reader
				might come away knowing something mathematical they didn't before.
			</p>
			<p>
				The topic could be at any level, whether that's basic math for young children or
				higher-level math.
			</p>
		</details>
		<!-- Software -->
		<details>
			<summary id="software"><a href="/rules#software">What software should I use? </a></summary>
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
		<!-- How many entries? -->
		<details>
			<summary id="how-many-entries"
				><a href="/rules#how-many-entries">How many entries can I submit? </a></summary
			>
			<p>
				Only one entry is allowed per creator identity. This means one video per YouTube channel,
				one post per blog, one page per itch.io account etc.
			</p>

			<p>
				However, you’re welcome to collaborate on additional entries submitted under someone else's
				channel, blog, or account.
			</p>

			<p>
				<em
					>For example: you could submit a solo video on your own YouTube channel, and also
					co-author a blog post that's submitted under a friend’s website.</em
				>
			</p>
		</details>
		<!-- Can I submit a part of a series? -->
		<details>
			<summary id="no-series"
				><a href="/rules#no-series">Can I submit a part of a series?</a></summary
			>
			<p>
				Each entry should be self-contained, not part of a series, playlist, or larger project:
				something one can dive into without needing extra context.
			</p>

			<p>
				This helps judges focus on your work as a complete piece, and give it the attention it
				deserves, with no ambiguity about what is actually part of the entry and what should be
				reviewed.
			</p>
		</details>
		<!-- Can I use old material? -->
		<details>
			<summary id="only-new-content"
				><a href="/rules#only-new-content">Can I use an old entry? </a></summary
			>
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
			<summary id="in-english-or-with-translation"
				><a href="/rules#in-english-or-with-translation"
					>Does it have to be in English?
				</a></summary
			>
			<p>It has to be available in English: subtitles or translation are needed.</p>
			<p>
				If you want to put out an explainer in another language, wonderful! Please do! But the
				judges here will be English speakers, so to be considered for the contest the lesson has to
				be accessible to them.
			</p>
		</details>
		<!-- Copyright -->
		<details>
			<summary id="copyrighted-material"
				><a href="/rules#copyrighted-material">Can I use copyrighted material? </a></summary
			>
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
		<!-- Ads -->
		<details>
			<summary id="ads"><a href="/rules#ads">Can my content include ads?</a></summary>
			<p>
				Your entry can optionally include ads or sponsorships within the content itself. However ads
				are not allowed in your entry's title or description, as the SoME website and archive do not
				endorse the promoted products.
			</p>
			<p>
				Also keep in mind that reviewers might get turned away by too long or too aggressive ads and
				sponsor segments
			</p>
		</details>
		<!-- No paywall, login, download -->
		<details>
			<summary id="no-paywall"
				><a href="/rules#no-paywall">Can my entry be behind a paywall or require an account?</a
				></summary
			>
			<p>
				No. All SoME entries must be freely accessible to anyone with a web browser. This means your
				content must not be behind a paywall, require a login, or force users to create an account
				on a third-party platform.
			</p>
			<p>
				Additionally, your entry should not require viewers to download or install anything to
				access the content. It should work directly in a modern web browser without extra steps.
			</p>
			<p>
				Reviewers may skip over entries that are gated, difficult to access, or require special
				software.
			</p>
		</details>
		<!-- Winners -->
		<details>
			<summary id="winners-selection"
				><a href="/rules#winners-selection">How will winners be selected?</a></summary
			>
			<p>
				Winners will be chosen through a peer review phase, with final results announced at the end
				of the competition. Curious about how the voting works? You can learn more about it <a
					href="/algorithm">here</a
				>.
			</p>
			<p>
				Peer review basics: Judges will review entries one by one, scoring each on a continuous
				scale from 1 to 9. The guiding question is: "How valuable is this entry to the space of
				online math exposition, compared to the typical math video/post you've seen?"
			</p>
			<p>
				Think of it like a more thoughtful version of a thumbs-up or thumbs-down. Voting should feel
				natural: you can round to whole numbers, half-points, go to the first decimal place or even
				to the second decimal place if you want finer control. And if you change your mind later? No
				problem, you're free to update earlier votes anytime.
			</p>
			<p>
				To help you with the review process, here are some broad guidelines for what we're hoping to
				see:
			</p>
			<ul>
				<li>
					<b>Motivation:</b> By the end of the introduction it should be clear why the topic matters
					and why someone should be excited to learn about it.
				</li>
				<li>
					<b> Clarity: </b> Jargon should be explained, the goals of the lesson should be easy to understand
					with minimal background knowledge, and the presentation should show care for people who might
					be new to the topic.
				</li>
				<li>
					<b>Novelty:</b> The idea doesn't have to be brand new, but the presentation should feel fresh,
					either by breathing new life into a familiar topic, or shining a light on a hidden gem, overlooked,
					or obscure idea that deserves more attention.
				</li>
				<li>
					<b>Memorability:</b> Something should make the piece stick with the audience, even months later,
					whether that's the beauty of the presentation, the enthusiasm of the presenter, or a mind-blowing
					"aha!" moment.
				</li>
			</ul>
		</details>
		<details>
			<summary id="prize"> <a href="/rules#prize">Is there a prize?</a></summary>
			<p>
				Yes. You can read more about it on the <a href="/prize"> dedicated page </a>.
			</p>
		</details>
	</section>
</article>

<style>
	summary > a {
		position: relative;

		&::before {
			position: absolute;
			left: calc(-4 * var(--spacing));
			top: 0;
			content: "#";
			opacity: 0.25;
			font-size: 1rem;
			transition: 200ms ease-out opacity;
		}

		&:hover::before {
			opacity: 0.6;
		}
	}
</style>
