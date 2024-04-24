<script>
	import { competitionStarted } from '$lib/utils';
	import Time from '$lib/components/Time.svelte';
	import { COMPETITION_FULL_NAME, COMPETITION_SHORT_NAME } from '$lib/config';
	import { PUBLIC_REGISTRATION_END } from '$env/static/public';
</script>

<svelte:head>
	<title>Rules &middot; {COMPETITION_SHORT_NAME}</title>
</svelte:head>

<article class="layout-prose">
	<h2>What are the constraints for entries?</h2>

	<ol>
		<li>It has to be something new you make this summer</li>
		<p>
			The spirit of this is to encourage people who've never put stuff online before. If you want to
			work on something you sort of started once before, that's probably fine, but it can't be
			something you already published before this contest. Optimally, you'd use this as a chance to
			try something new you otherwise might not have.
		</p>

		<li>It has to be about math.</li>
		<p>
			Here we mean &laquo; math &raquo; very broadly, and more applied topics like physics or
			computer science are abundantly welcome. It just has to be the case that a viewer/reader might
			come away knowing something mathematical they didn't before.
		</p>
		<p>
			The topic could be at any level, whether that's basic math for young children or higher-level
			math. If you're assuming a certain background level for the target audience, kindly mention it
			below. It's hard because we don't want to discourage topics with a very niche target audience,
			as those lessons can sometimes be the most valuable. However, if your lesson assumes
			particular expertise, e.g. a comfort with algebraic geometry, keep in mind that our judges may
			not fit into this category. So to actually win the contest, it's helpful if the topic is
			accessible to someone with, say, a background in standard undergrad math topics.
		</p>

		<li>One entry per person/group</li>
		<p>
			We hope you make more, but we only have the capacity to judge participants based on a single
			entry.
		</p>
		<li>It has to be available in English: subtitles or translation are needed</li>
		<p>
			If you want to put out an explainer in another language, wonderful! Please do! But the judges
			here will be English speakers, so to be considered for the contest the lesson has to be
			accessible to them.
		</p>
		<li>It has to be publicly visible and available for people to consume for free</li>
	</ol>

	<h2>Copyright</h2>
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

	<p>
		Exception: We have a standing agreement with Desmos that you may use this software in the
		competition.
	</p>

	<h2>When is the registration deadline?</h2>
	{#if competitionStarted()}
		<p>
			You can register until
			<Time datetime={PUBLIC_REGISTRATION_END} />
		</p>
	{:else}
		<p>The competition has not started yet</p>
	{/if}

	<h2>How will winners be selected?</h2>
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
			<b>Novelty:</b> It doesn't necessarily have to be an original idea or original topic, but it should
			offer someone an experience they might otherwise not have by searching around online. Some of the
			greatest value comes from covering common topics in better ways. Other times there's value in surfacing
			otherwise obscure ideas which more people should know about.
		</li>
		<li>
			<b>Memorability:</b> Something should make the piece easy to remember even several months later.
			Maybe it's the beauty of the presentation, the enthusiasm of the presenter, or the mind-blowingness
			of an aha moment.
		</li>
	</ul>
	<p>
		A peer review process will help filter the better entries. Then the admins will manually select
		the best entries.
	</p>
	<strong>
		If your entry does not respect the rules or copyright notice you will not be eligible to accept
		any prize money.
	</strong>
	<p>
		For longer works, judges might not be able to consume the full video/post. Again, what's hard
		about this is that sometimes great explainers are longer, such as a full lecture and we don't
		want to discourage those. Just understand that to select winners, there is only so much time
		available for review, so the substance of your work should be clearly visible with a 5-10 minute
		view.
	</p>
</article>
