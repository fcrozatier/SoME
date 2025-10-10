<script lang="ts">
	import { enhance } from "$app/forms";
	import { disableSubmitterAndSetValidity } from "$lib/actions";

	let { data } = $props();
</script>

<article class="mx-auto w-4/5 max-w-5xl overflow-x-auto">
	<h2>Feedback</h2>

	<!-- <form
		class="p-1 flex gap-2"
		action="?/filter"
		method="post"
		use:enhance={disableSubmitterAndSetValidity()}
	>
		<select class="select-bordered select" name="filter">
			<option value="feedback">general feedback</option>
			<option value="peer_review_feedback">peer review feedback (convenient time)</option>
			<option value="ai_feedback">ai feedback</option>
			<option value="creator_sharable_vote_link">creator sharable vote link feedback</option>
			<option value="a11y_feedback">accessibility feedback</option>
		</select>
		<button class="btn btn-primary">filter</button>
	</form> -->

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
