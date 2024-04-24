<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { templateNames } from '$lib/config';

	let selected: string[] = [];
</script>

<article class="layout-prose">
	<h2>Send a message to the mailing list</h2>

	<form
		method="post"
		use:enhance={({ submitter }) => {
			submitter?.setAttribute('disabled', 'on');

			return async ({ update }) => {
				await update();
				submitter?.removeAttribute('disabled');
			};
		}}
	>
		<p>Choose a message to send</p>

		<div class="form-control">
			{#each templateNames as template_name, i}
				<label for="template-{i}" class="label cursor-pointer justify-start gap-2">
					<input
						id="template-{i}"
						class="radio"
						type="radio"
						name="template_name"
						value={template_name}
						bind:group={selected}
						required
					/>
					<span class="label-text capitalize"> {template_name.replaceAll('_', ' ')} </span>
				</label>
			{/each}
		</div>
		<p>
			<button class="btn-error btn" disabled={!selected.length}
				>Send message to all recipients of the mailing list</button
			>
		</p>
		{#if $page.status !== 200}
			<p class="text-error">Something went wrong</p>
		{/if}
	</form>
</article>
