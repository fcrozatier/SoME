<script lang="ts">
	import { enhance } from '$app/forms';
	import { toggleSelectAll } from '$lib/actions';
	import type { PageData } from './$types';

	export let data: PageData;
	$: flagged = data.flagged as {
		link: string;
		title: string;
		reason: string;
		email: string;
		creators: string[];
	}[];

	let selected: { email: string; link: string }[] = [];
</script>

<article class="mx-auto w-4/5 max-w-5xl overflow-x-auto">
	<h2>Reported entries to review</h2>

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
					<th>Entry</th>
					<th>Reason</th>
					<th class="mr-10">Creators</th>
					<th>Reported by</th>
				</tr>
			</thead>
			<tbody>
				{#each flagged as entry}
					<tr class="px-6">
						<td class="flex items-center"
							><input
								type="checkbox"
								class="checkbox"
								name="selected"
								value={{ link: entry.link, email: entry.email }}
								bind:group={selected}
							/></td
						>
						<td><a class="capitalize" href={entry.link} target="_blank">{entry.title}</a></td>
						<td><span class="">{entry.reason}</span></td>
						<td
							><div class="grid justify-items-end">
								{#each entry.creators as creator}
									<span>{creator}</span>
								{/each}
							</div></td
						>
						<td><span class="">{entry.email}</span></td>
					</tr>
				{:else}
					<p>No entries to review</p>
				{/each}
			</tbody>
		</table>
		<div>
			<button type="submit" formaction="?/ignore" class="btn" disabled={!selected.length}
				>Ignore</button
			>
			<button type="submit" formaction="?/remove" class="btn-error btn" disabled={!selected.length}
				>Flag</button
			>
			<p class="text-sm">
				(Flagging is not destructive: a flagged creator will still have access to his feedbacks)
			</p>
		</div>
	</form>
</article>

<style>
	tr {
		display: grid;
		grid-template-columns: auto 15rem 1fr auto auto;
		gap: 1rem;
		align-items: center;
	}

	tr:nth-child(even) {
		background-color: rgb(242, 242, 242);
	}
</style>
