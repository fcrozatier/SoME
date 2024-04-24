<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<article class="layout-prose">
	<form
		method="post"
		action="?/login"
		use:enhance={({ submitter }) => {
			submitter?.setAttribute('disabled', 'on');
			return async ({ update }) => {
				await update();
				submitter?.removeAttribute('disabled');
			};
		}}
	>
		<h2>Admin area</h2>
		<label for="password" class="label flex gap-2">
			<span class="flex-1"> Password </span>
		</label>
		<input
			id="password"
			type="password"
			name="password"
			class="input-bordered input w-full max-w-xs"
			required
		/>
		<button type="submit" class="btn-primary btn ml-1">Login </button>
		{#if form?.invalid}
			<p class="block text-error">something went wrong.</p>
		{/if}
	</form>
</article>
