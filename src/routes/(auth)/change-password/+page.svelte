<script lang="ts">
	import { enhance } from "$app/forms";
	import { disableSubmitterAndSetValidity } from "$lib/actions";
	import { makeTitle } from "$lib/utils/makeTitle.js";
	import { ChangePasswordSchema } from "$lib/validation.js";
	import * as fg from "formgator";

	const { form } = $props();

	let password = $state("");
</script>

<svelte:head>
	<title>{makeTitle("Change Password")}</title>
</svelte:head>

<article class="layout-prose max-w-2xl!">
	{#if form?.success}
		<h2>Change your password</h2>
		<p>
			You're about to receive an email containing a validation link to confirm your password reset
		</p>
	{:else}
		<form class="space-y-2" method="POST" use:enhance={disableSubmitterAndSetValidity()}>
			<h2>Change your password</h2>
			<!-- Firefox hack to prevent showing the manage password popup on the email field -->
			<input type="text" style="display:none" />
			<input type="password" style="display:none" />
			<!-- /hack -->

			<div class="form-control">
				<label for="email" class="label">
					<span class="label-text"> Email </span>
				</label>
				<input
					id="email"
					type="email"
					name="email"
					class="input-bordered input w-full"
					placeholder="Email address of your account"
					autocomplete="email"
					aria-errormessage="email-error"
					aria-invalid={!!form?.issues?.email}
					{...fg.splat(ChangePasswordSchema["email"].attributes)}
				/>
				{#if form?.issues?.email}
					<span id="email-error" class="error-message">{form.issues.email.message}</span>
				{/if}
			</div>

			<div class="form-control">
				<label for="password" class="label">
					<span class="label-text">New Password </span>
				</label>
				<input
					id="password"
					type="password"
					name="password"
					class="input-bordered input w-full"
					placeholder="Choose your password"
					bind:value={password}
					autocomplete="new-password"
					aria-errormessage="password-error"
					aria-invalid={!!form?.issues?.password}
					aria-describedby="password-format"
					{...fg.splat(ChangePasswordSchema["password"].attributes)}
				/>
				{#if form?.issues?.password}
					<span id="password-error" class="error-message">{form.issues.password.message}</span>
				{/if}
				<span id="password-format" class={`text-sm text-gray-500`}>
					8 characters minimum, with lowercase, uppercase and number
				</span>
			</div>

			<div class="form-control">
				<label for="password" class="label">
					<span class="label-text">Confirm Password </span>
				</label>
				<input
					id="password"
					type="password"
					name="password2"
					class="input-bordered input w-full"
					pattern={password}
					title="Passwords should match"
					placeholder="Confirm your new password"
					autocomplete="new-password"
					aria-errormessage="password2-error"
					aria-invalid={!!form?.issues?.password2}
					{...fg.splat(ChangePasswordSchema["password2"].attributes)}
				/>
				{#if form?.issues?.password2}
					<span id="password2-error" class="error-message">{form.issues.password2.message}</span>
				{/if}
			</div>

			<p>
				<button type="submit" class="btn btn-neutral">Change password</button>

				{#if form?.feedback}
					<span class="error-message mt-2" style:--tw-prose-links="--color-red-600"
						>{@html form.feedback}</span
					>
				{/if}
			</p>
		</form>
	{/if}
</article>
