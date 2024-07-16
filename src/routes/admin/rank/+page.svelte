<script lang="ts">
	import { enhance } from '$app/forms';
	import { categories } from '$lib/config';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let computing = false;
</script>

<article class="layout-prose">
	<h2>Rank entries</h2>
	<p>Applies a PageRank algorithm and returns the top 100 entries</p>
	{#if computing}
		<p>Computing... this can take a moment</p>
	{:else}
		<form
			method="post"
			action="?/rank"
			use:enhance={({ submitter }) => {
				submitter?.setAttribute('disabled', 'on');
				computing = true;
				return async ({ update }) => {
					await update();
					submitter?.removeAttribute('disabled');
					computing = false;
				};
			}}
		>
			<div class="flex gap-4">
				{#each categories as category}
					<button class="btn-primary btn" type="submit" name="category" value={category}
						>Rank {category}s</button
					>
				{/each}
			</div>
			{#if form?.noNodes}
				<p class="text-error">This graph contains no nodes</p>
			{/if}
		</form>
	{/if}
	{#if form?.ranking}
		<table class="table-zebra table w-full">
			<thead>
				<tr>
					<th />
					<th>Title</th>
					<th>Score</th>
				</tr>
			</thead>
			<tbody>
				{#each form?.ranking as { title, link, score }, i}
					<tr>
						<th>{i + 1}</th>
						<td><a class="capitalize" href={link}>{title}</a></td>
						<td><span>{score}</span></td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</article>
