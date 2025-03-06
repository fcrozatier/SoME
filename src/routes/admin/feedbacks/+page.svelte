<script lang="ts">
	import { enhance } from "$app/forms";
	import { toggleSelectAll } from "$lib/actions";
	import { newToast } from "$lib/components/Toasts.svelte";

	let { data } = $props();

	let selected: [string, string][] = $state([]);
</script>

<article class="mx-auto w-4/5 max-w-5xl">
	<h2>Feedbacks to review</h2>

	<table class="w-full">
		<thead>
			<tr class="px-6">
				<th class="flex items-center"
					><input id="all" type="checkbox" class="checkbox" use:toggleSelectAll /></th
				>
				<th class="text-left">Entry</th>
				<th class="text-left">Feedback</th>
			</tr>
		</thead>
		<tbody>
			{#each data.feedbacks as f}
				<tr class="px-6 py-2">
					<td class="flex items-center"
						><input
							type="checkbox"
							class="checkbox"
							name="selected"
							value={[f.user_uid, f.uid]}
							bind:group={selected}
						/></td
					>
					<td><a class="capitalize" href={f.url} target="_blank">{f.title}</a></td>
					<td><span class="whitespace-pre-wrap">{f.feedback}</span></td>
				</tr>
			{:else}
				<tr>
					<td>
						<p class="px-6">No feedback to review</p>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<form
		method="post"
		use:enhance={({ formData }) => {
			const buttons = document.querySelectorAll("button");
			buttons.forEach((b) => b.setAttribute("disabled", "on"));
			formData.append("selection", JSON.stringify(selected));

			return async ({ update, result, action }) => {
				buttons.forEach((b) => b.removeAttribute("disabled"));
				if (result.type === "success") {
					const content =
						"Feedback" +
						(selected.length === 1 ? "" : "s") +
						" " +
						(action.search === "?/keep" ? "kept" : "removed");

					newToast({ type: "info", content });
				}
				await update();
			};
		}}
	>
		<div class="flex gap-4">
			<button type="submit" formaction="?/keep" class="btn btn-neutral" disabled={!selected.length}
				>Keep</button
			>
			<button type="submit" formaction="?/remove" class="btn-error btn" disabled={!selected.length}
				>Remove</button
			>
		</div>
		<p class="text-sm">Removing a feedback does not impact the score of the related entry.</p>
	</form>
</article>

<style>
	tr {
		display: grid;
		grid-template-columns: auto 1fr 1fr;
		gap: 1rem;
		align-items: start;
	}
	tr:nth-child(even) {
		background-color: rgb(242, 242, 242);
	}
</style>
