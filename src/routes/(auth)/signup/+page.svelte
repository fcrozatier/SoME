<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/state";
	import { disableSubmitter } from "$lib/actions.js";
	import { COMPETITION_FULL_NAME, COMPETITION_SHORT_NAME } from "$lib/config";

	let { form } = $props();

	export const snapshot = {
		capture: () => {
			return {
				username,
				email,
			};
		},
		restore: (v) => {
			username = v.username;
			email = v.email;
		},
	};

	let username = $state("");
	let email = $state("");
</script>

<svelte:head>
	<title>Join &middot; {COMPETITION_SHORT_NAME}</title>
</svelte:head>

<article class="layout-prose">
	{#if form?.success}
		<h2>Welcome to the {COMPETITION_FULL_NAME} community!</h2>
	{:else}
		<h2>Join the competition</h2>
		<p>By creating an account you'll be able to participate as either a creator or a judge</p>

		<form method="post" use:enhance={disableSubmitter}>
			<div class="form-control max-w-md">
				<label for="username" class="label">
					<span class="label-text"> Username </span>
				</label>
				<input
					id="username"
					type="text"
					name="username"
					class="input-bordered input w-full"
					placeholder="Choose your username"
					bind:value={username}
					aria-errormessage="username-error"
					aria-invalid={!!form?.issues?.username}
					autocomplete="username"
					spellcheck="false"
					maxlength="32"
					required
				/>
				{#if form?.issues?.username}
					<span id="username-error" class="error-message">{form.issues.username.message}</span>
				{/if}
			</div>

			<div class="form-control max-w-md">
				<label for="email" class="label">
					<span class="label-text"> Email </span>
				</label>
				<input
					id="email"
					type="email"
					name="email"
					class="input-bordered input w-full"
					placeholder="Enter your email address"
					bind:value={email}
					aria-errormessage="email-error"
					aria-invalid={!!form?.issues?.email}
					autocomplete="email"
					spellcheck="false"
					maxlength="128"
					required
				/>
				{#if form?.issues?.email}
					<span id="email-error" class="error-message">{form.issues.email.message}</span>
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
					placeholder="Choose your password"
					autocomplete="new-password"
					aria-describedby="password-format"
					minlength="8"
					required
				/>
				{#if form?.issues?.password}
					<span class="error-message">{form.issues.password.message}</span>
				{/if}
				<span id="password-format" class={`text-sm text-gray-500`}>
					8 characters minimum, with lowercase, uppercase and number
				</span>
			</div>

			<div class="form-control max-w-md">
				<label for="rules" class="label justify-normal gap-4">
					<input id="rules" type="checkbox" name="rules" class="checkbox" required />
					<span class="label-text">
						I've read the <a href="/rules">rules</a> of the competition
					</span>
				</label>
				{#if form?.issues?.rules}
					<span class="error-message">{form.issues.rules.message}</span>
				{/if}
			</div>

			<p>
				<button class="btn-neutral btn block">Register</button>
				{#if form?.issues || page.status !== 200}
					<span class="error-message mt-2">
						Something went wrong. {form?.issues
							? "Please correct the highlighted fields above"
							: "There was a network error. Please try again later"}
					</span>
				{/if}
			</p>
			<p class="text-sm">
				<a href="/gdpr" rel="privacy-policy">Privacy policy</a>
			</p>
		</form>
	{/if}
</article>

<style>
	label {
		margin-top: calc(var(--spacing) * 2);
	}
</style>
