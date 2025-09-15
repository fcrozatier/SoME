<script lang="ts">
	let { data } = $props();
</script>

<article class="mx-auto w-4/5 max-w-5xl overflow-x-auto">
	<h2>Feedback</h2>

	<ul class="list-none">
		{#each data.surveys as { json }}
			<li>
				{#each Object.entries(JSON.parse(json as string)) as [k, v]}
					<p class="mt-0 mb-0"><b>{k}</b>: {v}</p>
				{/each}
			</li>
			<hr />
		{:else}
			<li>No survey results</li>
		{/each}
	</ul>
</article>
