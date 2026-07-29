<script lang="ts">
	import { categories } from "$lib/config";
	import { makeTitle } from "$lib/utils/makeTitle";
	import { voteOpen } from "$lib/utils/time";

	let { data } = $props();
</script>

<svelte:head>
	<title>{makeTitle("Vote")}</title>
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
						<b>Leave feedback</b> for the creator. You can use basic
						<a href="https://www.markdownguide.org/cheat-sheet/" target="_blank">Markdown</a> with
						tables, fenced code blocks and
						<a href="https://quickref.me/latex" target="_blank">LaTeX</a>
						in your feedback. Wrap inline LaTeX formulas with&nbsp;<code>$</code>
						and displayed formulas with&nbsp;<code class="text-nowrap">$$</code>
					</li>
				</ul>
				<p>You can also:</p>
				<ul class="space-y-1! my-0!">
					<li><b>Skip</b> an entry. You won't see it again in the vote.</li>
					<li class="mt-1!">
						<b>Add to your Watchlist</b> entries you want to save for later. This is useful for
						example when you know reviewing an entry will take more time than you currently have,
						want to save it for later but still keep voting. You can find these entries in
						<a href="/user/watchlist">My Watchlist</a> page
					</li>
					<li>
						<b>Flag</b> entries that break the rules. You can optionally submit your vote with a flag.
					</li>
					<li><b>Switch categories</b> (video or non-video) anytime by returning here.</li>
					<li class="mt-1!">
						<b>Update past votes</b> anytime from
						<a href="/user/votes">My Votes</a> page, if you change your mind on an entry, or want to fine
						tune scores after a few votes.
					</li>
				</ul>

				{#if data.hasPreferences}
					<p>
						Entries will match your review preferences, which you can adjust anytime in your <a
							href="/user/profile">Profile</a
						>
					</p>
				{/if}
			</section>
		{/if}
		{#if data.hasPreferences}
			<p>Choose a category:</p>
			<p class="flex gap-4">
				{#each categories.toReversed() as category}
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
