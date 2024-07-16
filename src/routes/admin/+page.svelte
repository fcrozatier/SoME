<script lang="ts">
	import { enhance } from '$app/forms';

	export let form;
	export let data;
</script>

<article class="layout-prose">
	<h2>Admin area</h2>
	{#if data.isAdmin}
		<h3>Review</h3>
		<ul>
			<li><a href="/admin/flagged">Flags</a></li>
			<li><a href="/admin/feedbacks">Feedbacks</a></li>
			<!-- <li><a href="/admin/rank">Rank entries</a></li> -->
		</ul>
	{:else}
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
			<label for="email" class="label flex gap-2">
				<span class="flex-1"> Email </span>
			</label>
			<input
				id="email"
				type="email"
				name="email"
				class="input-bordered input w-full max-w-xs"
				required
			/>
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
			<div class="mt-4">
				<button type="submit" class="btn-primary btn ml-1">Login </button>
			</div>
			{#if form?.invalid}
				<p class="block text-error">something went wrong.</p>
			{/if}
		</form>
	{/if}
</article>
