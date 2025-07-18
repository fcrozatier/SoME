<script lang="ts">
	import { enhance } from "$app/forms";
	import { disableSubmitterAndSetValidity } from "$lib/actions.js";
	import { makeTitle } from "$lib/utils/makeTitle.js";
	import { LoginSchema } from "$lib/validation";
	import * as fg from "formgator";

	let { form } = $props();
</script>

<svelte:head>
	<title>{makeTitle("Login")}</title>
</svelte:head>

<article class="layout-prose max-w-2xl!">
	<h2>Login</h2>

	<form class="space-y-2" method="post" use:enhance={disableSubmitterAndSetValidity()}>
		<div class="form-control">
			<label for="email" class="label">
				<span class="label-text"> Email </span>
			</label>
			<input
				id="email"
				type="email"
				name="email"
				class="input-bordered input w-full"
				placeholder="Your email address"
				{...fg.splat(LoginSchema["email"].attributes)}
				aria-errormessage="credentials-error"
				aria-invalid={!!form?.issues?.email}
				autocomplete="email"
			/>
			{#if form?.issues?.email}
				<span id="credentials-error" class="error-message">{form.issues.email.message}</span>
			{/if}
		</div>

		<div class="form-control">
			<label for="password" class="label">
				<span class="label-text"> Password </span>
			</label>
			<input
				id="password"
				type="password"
				name="password"
				class="input-bordered input w-full"
				placeholder=" "
				{...fg.splat(LoginSchema["password"].attributes)}
				autocomplete="current-password"
				aria-errormessage="credentials-error"
				aria-invalid={!!form?.issues?.password}
			/>
			{#if form?.issues?.password}
				<span id="credentials-error" class="error-message">{form.issues.password.message}</span>
			{/if}
		</div>

		<div>
			<p>
				<button class="btn-neutral btn block">Login</button>
			</p>
			<div class="text-sm grid gap-2">
				<span>
					Not registered yet? <a href="/signup">Create an account</a>
				</span>
				<span>
					Forgot your password? <a href="/change-password">Change password</a>
				</span>
			</div>
		</div>
	</form>
</article>

<style>
	label {
		margin-top: calc(var(--spacing) * 2);
	}
</style>
