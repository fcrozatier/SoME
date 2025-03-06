<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/state";
	import { newToast } from "$lib/components/Toasts.svelte";

	let { data } = $props();
</script>

<article class="layout-prose">
	<h2>Rank {page.params.category} entries</h2>

	<form
		method="post"
		action="?/rank"
		use:enhance={({ submitter }) => {
			submitter?.setAttribute("disabled", "on");

			return async ({ update, result }) => {
				await update();
				submitter?.removeAttribute("disabled");
				if (result.type === "success") {
					newToast({ content: "Entries ranked!", type: "success" });
				}
			};
		}}
	>
		<button class="btn-neutral btn" type="submit">Rank</button>
	</form>

	<table class="table w-full">
		<thead>
			<tr>
				<th>Title</th>
				<th>Rank</th>
			</tr>
		</thead>
		<tbody>
			{#each data.entries as { title, rank }}
				<tr>
					<td>{title}</td>
					<td>{rank}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</article>

<style>
	tr {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 1rem;
		align-items: start;
	}

	tr:nth-child(even) {
		background-color: rgb(242, 242, 242);
	}
</style>
