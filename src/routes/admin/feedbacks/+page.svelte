<script lang="ts">
	import { enhance } from '$app/forms';
	import type { FeedbackProperties } from '$lib/server/neo4j';
	import { toggleSelectAll } from '$lib/actions';
	import type { PageData } from './$types';

	export let data: PageData;
	$: feedbacks = data.feedbacks as FeedbackProperties[];

	let selected: { email: string; link: string }[] = [];
</script>

<article class="mx-auto w-4/5 max-w-5xl">
	<h2>Feedbacks to review</h2>

	<form
		method="post"
		use:enhance={({ formData }) => {
			const buttons = document.querySelectorAll('button');
			buttons.forEach((b) => b.setAttribute('disabled', 'on'));
			formData.append('selection', JSON.stringify(selected));

			return async ({ update }) => {
				await update();
				buttons.forEach((b) => b.removeAttribute('disabled'));
			};
		}}
	>
		<table class="w-full">
			<thead>
				<tr class="px-6">
					<th class="flex items-center"
						><input id="all" type="checkbox" class="checkbox" use:toggleSelectAll /></th
					>
					<th>Explicit</th>
					<th>Feedback</th>
				</tr>
			</thead>
			<tbody>
				{#each feedbacks as feedback}
					<tr class="px-6">
						<td class="flex items-center"
							><input
								type="checkbox"
								class="checkbox"
								name="selected"
								value={feedback.token}
								bind:group={selected}
							/></td
						>
						<td class="flex justify-center"><p>{feedback.explicit ? '☢️' : ''}</p></td>
						<td><p class="whitespace-pre-wrap">{feedback.value}</p></td>
					</tr>
				{:else}
					<p class="px-6">No feedback to review</p>
				{/each}
			</tbody>
		</table>
		<button type="submit" formaction="?/ignore" class="btn" disabled={!selected.length}
			>Ignore</button
		>
		<button type="submit" formaction="?/remove" class="btn-error btn" disabled={!selected.length}
			>Remove</button
		>
	</form>
</article>

<style>
	tr {
		display: grid;
		grid-template-columns: auto 4rem 1fr;
		gap: 1rem;
		align-items: center;
	}
	tr:nth-child(even) {
		background-color: rgb(242, 242, 242);
	}
</style>
