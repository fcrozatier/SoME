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

				<p>You'll review entries one by one. For each entry, you'll:</p>
				<ul class="space-y-1!">
					<li>
						<strong>Score it</strong> on a continuous scale from 1 to 9. Use whole numbers, halves or
						decimals, whatever feels right.
					</li>
					<li class="mt-1!">
						<strong>Leave feedback</strong> for the creator. You can use basic
						<a href="https://www.markdownguide.org/cheat-sheet/" target="_blank">Markdown</a> with
						tables, fenced code blocks and
						<a href="https://quickref.me/latex" target="_blank">LaTeX</a>
						in your feedback. Wrap inline LaTeX formulas with&nbsp;<code>$</code>
						and displayed formulas with&nbsp;<code class="text-nowrap">$$</code>
					</li>
				</ul>
				<p>You can also:</p>
				<ul class="space-y-1! my-0!">
					<li><strong>Skip</strong> an entry</li>
					<li>
						<strong>Flag</strong> entries that break the rules. You can optionally submit your vote with
						a flag
					</li>
					<li><strong>Switch categories</strong> (video or non-video) anytime by returning here</li>
					<li class="mt-1!">
						<strong>Update past votes</strong> anytime from the
						<a href="/user/votes">My Votes</a> page
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
