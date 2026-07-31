<script lang="ts">
	import { CATEGORIES } from "$lib/constants";
	import { formatTitle } from "$lib/utils/formatting.js";
	import { voteOpen } from "$lib/utils/time";

	let { data } = $props();
</script>

<svelte:head>
	<title>{formatTitle("Vote")}</title>
</svelte:head>

<article class="layout-prose">
	<h2>Vote</h2>
	{#if voteOpen()}
		{#if data.firstVote}
			<section class="space-y-2!">
				<p>You're about to cast your first vote. Here's how it works.</p>

				<p>
					You'll review entries one by one, with this question in mind: <em>
						"How valuable is this entry to the space of online math exposition, compared to the
						typical video or article you've seen?"
					</em>. For each entry:
				</p>
				<ul class="space-y-1!">
					<li>
						<b>Score it</b> on a continuous scale from 1 to 9, corresponding to the labels: Notably
						worse, Not as good, About the same, Better than most, Outstanding.

						<p>
							It's a <b>continuous</b> scale, feel free to position the cursor wherever it feels right
							on the scale.
						</p>
					</li>
					<li class="mt-1!">
						<b>Leave feedback</b> for the creators. You can use basic
						<a href="https://www.markdownguide.org/cheat-sheet/" target="_blank">Markdown</a> with
						tables, fenced code blocks and
						<a href="https://quickref.me/latex" target="_blank">LaTeX</a>
						in your feedback. Wrap inline LaTeX formulas with&nbsp;<code>$</code>
						and displayed formulas with&nbsp;<code class="text-nowrap">$$</code>

						<p>
							Help the creators understand your grade by being constructive about what you liked in
							their entry and what's to be improved.
						</p>
					</li>
				</ul>
				<p>You can also:</p>
				<ul class="space-y-1! my-0!">
					<li class="mt-1!">
						<b>Update past votes</b> anytime from
						<a href="/user/votes">My Votes</a> page, if you change your mind on an entry, or want to normalise
						scores after a few votes.
					</li>
					<li><b>Skip</b> an entry. You won't see it again during the vote.</li>
					<li class="mt-1!">
						<b>Add to Watchlist</b> entries you want to save for later. For example, this can be
						useful when you know reviewing an entry will take more time than you currently have,
						want to save it for later but still want to keep voting. You can find these entries in
						<a href="/user/watchlist">My Watchlist</a> page.
					</li>
					<li>
						<b>Flag</b> entries that break the rules. You can optionally submit your vote with a flag.
					</li>
					<li><b>Switch categories</b> (video or non-video) anytime by returning here.</li>
				</ul>

				{#if data.hasPreferences}
					<p>
						Entries will match your review preferences, which you can adjust anytime in your <a
							href="/user/profile">Profile</a
						>
					</p>
				{/if}

				<p>
					The competition features {data.nbEntries} entries this year, so you can only reasonably vote
					on a fraction of these. If you make 5 to 10 votes, that would already be a great contribution!
				</p>
			</section>
		{/if}
		{#if data.hasPreferences}
			<p>Choose a category:</p>
			<p class="flex gap-4">
				{#each CATEGORIES.toReversed() as category}
					<a class="btn-neutral btn" href={`/user/vote/${category}`}>{category}</a>
				{/each}
			</p>
		{:else}
			<p>
				Before continuing please <strong>update your review preferences</strong> in your
				<a href="/user/profile">Profile</a>
			</p>
		{/if}
	{:else}
		<p>The vote is closed.</p>
	{/if}
</article>
