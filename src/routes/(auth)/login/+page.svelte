<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/state";
	import { disableSubmitter } from "$lib/actions.js";
	import { titleSnippet } from "../../+layout.svelte";

	let { form } = $props();

	export const snapshot = {
		capture: () => {
			return {
				email,
			};
		},
		restore: (v) => {
			email = v.email;
		},
	};

	let email = $state("");
</script>

<svelte:head>
	{@render titleSnippet("Login")}
</svelte:head>

<article class="layout-prose">
	<h2>Login</h2>

	<form method="post" use:enhance={disableSubmitter}>
		<div class="form-control max-w-md">
			<label for="email" class="label">
				<span class="label-text"> Email </span>
			</label>
			<input
				id="email"
				type="email"
				name="email"
				class="input-bordered input w-full"
				placeholder="Your email address"
				bind:value={email}
				aria-errormessage="credentials-error"
				aria-invalid={!!form?.issues?.credentials}
				autocomplete="email"
				required
			/>
			{#if form?.issues?.credentials}
				<span id="credentials-error" class="error-message">{form.issues.credentials.message}</span>
			{/if}
		</div>

		<div class="form-control max-w-md">
			<label for="password" class="label">
				<span class="label-text"> Password </span>
			</label>
			<input
				id="password"
				type="password"
				name="password"
				class="input-bordered input w-full"
				placeholder=" "
				autocomplete="current-password"
				aria-errormessage="credentials-error"
				aria-invalid={!!form?.issues?.credentials}
				required
			/>
		</div>

		<p>
			<button class="btn-neutral btn block">Login</button>
		</p>
		<p class="text-sm">
			Not registered? <a href="/signup">Create account</a>
		</p>
	</form>
</article>

<style>
	label {
		margin-top: calc(var(--spacing) * 2);
	}
</style>
