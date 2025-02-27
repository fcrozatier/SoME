<script lang="ts">
	let { data } = $props();
</script>

<article class="mx-auto w-4/5 max-w-5xl overflow-x-auto">
	<h2>Feedback</h2>

	<table class="w-full">
		<thead>
			<tr class="px-6">
				<th class="text-left">Some</th>
				<th class="text-left">Site </th>
				<th class="text-left">Off-season</th>
				<th class="text-left">Feedback</th>
			</tr>
		</thead>
		<tbody>
			{#each data.surveys as { some, site, off_season, feedback }}
				<tr class="px-6 py-2">
					<td class="text-center font-mono">{some}</td>
					<td class="text-center font-mono">{site}</td>
					<td class="text-center">{off_season ? "y" : "-"}</td>
					<td>{feedback}</td>
				</tr>
			{:else}
				<tr>
					<td>
						<p>No surveys yet</p>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</article>

<style>
	tr {
		display: grid;
		grid-template-columns: 50px 50px 100px 1fr;
		gap: 1rem;
		align-items: start;
	}

	tr:nth-child(even) {
		background-color: rgb(242, 242, 242);
	}
</style>
