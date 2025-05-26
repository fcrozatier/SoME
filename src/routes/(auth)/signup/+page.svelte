<script lang="ts">
	import { enhance } from "$app/forms";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { newToast } from "$lib/components/Toasts.svelte";
	import { FULL_NAME } from "$lib/config";
	import { setTitle } from "$lib/utils.js";
	import { NewUserSchema } from "$lib/validation.js";
	import * as fg from "formgator";

	let { form } = $props();

	export const snapshot = {
		capture: () => {
			return {
				username,
			};
		},
		restore: (v) => {
			username = v.username;
		},
	};

	let username = $state("");

	setTitle("Signup");
</script>

<article class="layout-prose">
	{#if form?.success}
		<h2>Welcome to the {FULL_NAME} community!</h2>
	{:else}
		<h2>Join the competition</h2>
		<p>By creating an account you'll be able to participate as either a creator or a judge</p>

		<form
			class="space-y-2"
			method="post"
			use:enhance={({ submitter }) => {
				submitter?.setAttribute("disabled", "on");

				return async ({ update, result, formElement, formData }) => {
					await update();
					submitter?.removeAttribute("disabled");

					if (result.type === "failure" && typeof result.data?.issues === "object") {
						const issues = result.data.issues as Record<string, fg.ValidationIssue>;

						for (const element of formElement.elements) {
							if (!(element instanceof HTMLInputElement)) continue;

							const customMessage = issues[element.name]?.message;
							if (customMessage) element.setCustomValidity(customMessage);
							element.reportValidity();

							element.addEventListener("input", () => element.setCustomValidity(""), {
								once: true,
							});
						}
					}

					if (result.type === "success") {
						const username = formData.get("username");
						if (username) {
							newToast({ type: "success", content: `You're now logged in as ${username}.` });
						}
						await goto("/user/entries");
					}
				};
			}}
		>
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
					{...fg.splat(NewUserSchema["username"].attributes)}
					aria-errormessage="username-error"
					aria-invalid={!!form?.issues?.username}
					autocomplete="username"
					spellcheck="false"
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
					aria-errormessage="email-error"
					aria-invalid={!!form?.issues?.email}
					{...fg.splat(NewUserSchema["email"].attributes)}
					autocomplete="email"
					spellcheck="false"
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
					aria-errormessage="password-error"
					aria-invalid={!!form?.issues?.password}
					aria-describedby="password-format"
					{...fg.splat(NewUserSchema["password"].attributes)}
				/>
				{#if form?.issues?.password}
					<span id="password-error" class="error-message">{form.issues.password.message}</span>
				{/if}
				<span id="password-format" class={`text-sm text-gray-500`}>
					8 characters minimum, with lowercase, uppercase and number
				</span>
			</div>

			<div class="form-control max-w-md">
				<span class="label label-text"> Are you a math teacher? </span>

				<span class="inline-flex gap-x-3 ml-2">
					<label>
						<input
							type="radio"
							name="isTeacher"
							class="radio"
							value="true"
							{...fg.splat(NewUserSchema["isTeacher"].attributes)}
						/>
						<span> Yes </span>
					</label>
					<label>
						<input
							type="radio"
							name="isTeacher"
							class="radio"
							value="false"
							{...fg.splat(NewUserSchema["isTeacher"].attributes)}
						/>
						<span> No </span>
					</label>
				</span>
				{#if form?.issues?.isTeacher}
					<span class="error-message">{form.issues.isTeacher.message}</span>
				{/if}
			</div>

			<div class="form-control max-w-md">
				<label for="rules" class="label justify-normal gap-4">
					<input
						id="rules"
						type="checkbox"
						name="rules"
						class="checkbox"
						{...fg.splat(NewUserSchema["rules"].attributes)}
					/>
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

			<div class="grid gap-2 text-sm">
				<span class="text-sm">
					Already have an account? <a href="/login">Login</a>
				</span>
				<span class="text-sm">
					<a href="/gdpr" rel="privacy-policy">Privacy policy</a>
				</span>
			</div>
		</form>
	{/if}
</article>

<style>
	label {
		margin-top: calc(var(--spacing) * 2);
	}
</style>
