<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import { loadPyodide } from 'pyodide';
	import { page } from '$app/stores';
	import { registrationOpen } from '$lib/utils';
	import { categories } from '$lib/config';
	import { onMount } from 'svelte';

	export let data: PageData;

	let creators = 0;
	categories.forEach((c) => (creators += data.analytics.get(c)));

	let computing = false;
	let message = 'Computing... this can take a moment';

	async function createGraph() {
		computing = true;

		message = 'Loading Pyodide, Numpy and utilities...';
		const pyodide = await loadPyodide({
			indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full'
		});
		await pyodide.loadPackage('numpy');
		const utilities = import.meta.glob('/graph/utilities.py', { eager: true, as: 'raw' });
		pyodide.runPython(utilities['/graph/utilities.py']);

		message = 'Computing graph edges...';
		const edges = [];
		for (const category of categories) {
			const N = data.analytics.get(category);
			const cycles = Math.ceil(Math.log10(N) + 1);
			const pairs = await pyodide.runPythonAsync(`expander_from_cycles(${cycles},${N})`);
			edges.push({ category, edges: pairs.toJs() });
		}

		computing = false;
		return edges;
	}

	let edges: Awaited<ReturnType<typeof createGraph>>;
	onMount(async () => {
		if (!data.analytics.get('graph') && !registrationOpen()) {
			edges = await createGraph();
		}
	});
</script>

<article class="layout-prose">
	<h2>Graph analytics</h2>
	<h3>Users</h3>

	<ul>
		<li><b>Creators:</b> {creators}</li>
		<li><b>Judges:</b> {data.analytics.get('judges') ?? 0}</li>
	</ul>

	<h3>Entries</h3>
	<table class="w-full">
		<thead>
			<tr>
				<th class="pl-8">Category</th>
				<th>Count</th>
			</tr>
		</thead>
		<tbody>
			{#each categories as category}
				<tr>
					<td class="pl-8">{category}</td>
					<td class="pr-4">{data.analytics.get(category)} </td>
				</tr>
			{/each}
		</tbody>
	</table>

	{#if !data.analytics.get('graph') && registrationOpen()}
		<p>To create the comparison graphs you need to close the registration first</p>
	{/if}
	{#if !data.analytics.get('graph') && !registrationOpen()}
		<p>Create the comparison graphs</p>
		{#if computing}
			<p>{message}</p>
		{/if}
		<form
			method="post"
			action="?/pairing"
			use:enhance={({ formData, submitter }) => {
				submitter?.setAttribute('disabled', 'on');
				formData.append('edges', JSON.stringify(edges));

				return async ({ update }) => {
					await update();
				};
			}}
		>
			<button class="btn-primary btn" disabled={computing}>Create pairings</button>
			{#if $page.status !== 200}
				<p class="text-error">Something went wrong</p>
			{/if}
		</form>
	{/if}
</article>
