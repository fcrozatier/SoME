<script lang="ts">
	import {
		PUBLIC_REGISTRATION_END,
		PUBLIC_REGISTRATION_START,
		PUBLIC_RESULTS_AVAILABLE,
		PUBLIC_VOTE_END,
		PUBLIC_VOTE_START,
	} from "$env/static/public";
	import { phaseOpen, resultsAvailable, voteOpen } from "$lib/utils/time";
	import Time from "./Time.svelte";
	import { page } from "$app/state";

	const phases = [
		{
			title: "Join the competition as a participant or judge",
			description:
				'Creators all work on their projects and the <a href="https://discord.gg/WZvZMVsXXR" target="_blank">Discord</a> server allows them to share partial progress, find collaborators and ask for help.',
			isOpen: phaseOpen(PUBLIC_REGISTRATION_START, PUBLIC_VOTE_END),
			dates: [PUBLIC_REGISTRATION_START, PUBLIC_REGISTRATION_END],
		},
		{
			title: "Vote for the best contributions",
			description:
				"This is the peer review phase where you'll be successively shown entries to review and optionally provide feedback. This is the heart of the event.",
			isOpen: voteOpen(),
			dates: [PUBLIC_VOTE_START, PUBLIC_VOTE_END],
		},
		{
			title: "Results and feedback",
			description: "The top entries and the complete ranking are revealed.",
			isOpen: resultsAvailable(),
			dates: [PUBLIC_RESULTS_AVAILABLE],
		},
	] as const;

	const dateFormat = {
		month: "short",
		day: "2-digit",
		hour: "numeric",
		minute: "numeric",
	} as const;
</script>

<!-- Timeline -->
<section class="layout-prose pb-4">
	<h2 class="mb-4 text-4xl font-black">Timeline</h2>
	<p>The competition has three phases:</p>
	<ul class="-ml-7 list-outside">
		{#each phases as phase, i}
			{@const [start, end] = phase.dates}
			<li class={phase.isOpen ? "marker:text-green-500" : ""}>
				<div class="mt-8">
					<span class="flex items-center gap-2 text-xl font-semibold">
						Phase {i + 1}:
						{phase.title}
						{#if phase.isOpen}
							<span class="badge badge-success">current</span>
						{/if}
					</span>
					<span class="text-sm text-gray-500">
						From <Time datetime={start} options={dateFormat} />
						{#if end}
							to <Time datetime={end} options={dateFormat} />
						{/if}
					</span>
				</div>

				<p class="text-sm mt-2">{@html phase.description}</p>
				{#if phase.isOpen}
					<p class="mt-6">
						{#if i === 0}
							{#if !page.data.user}
								<a class="btn-neutral btn" href="/signup">
									Join in <span class="ml-2 inline-block">&rarr;</span>
								</a>
							{:else}
								<a class="btn-neutral btn" href="/user/entries">
									Submit an entry <span class="ml-2 inline-block">&rarr;</span>
								</a>
							{/if}
						{:else if i === 1}
							<a class="btn-neutral btn" href="/user/vote">Vote</a>
						{:else if i === 2}
							<a class="btn-neutral btn mr-4" href="/archive">Results</a>
						{/if}
					</p>
				{/if}
			</li>
		{/each}
	</ul>
</section>
