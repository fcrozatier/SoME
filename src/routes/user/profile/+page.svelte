<script lang="ts">
	import { resetUsernameStatus, type UsernameStatus } from "$api/check-username/fetch.js";
	import { enhance } from "$app/forms";
	import { page } from "$app/state";
	import { disableSubmitterAndSetValidity } from "$lib/actions.js";
	import CircularProgress from "$lib/components/icons/CircularProgress.svelte";
	import Icon from "$lib/components/icons/Icon.svelte";
	import { makeTitle } from "$lib/utils/makeTitle.js";
	import { NewUserSchema } from "$lib/validation.js";
	import * as fg from "formgator";

	let { data, form } = $props();

	let username = $state(data.user.username ?? "");
	let usernameStatus: UsernameStatus = $state(undefined);
</script>

<svelte:head>
	<title>{makeTitle("Profile")}</title>
</svelte:head>

<article class="layout-prose max-w-2xl!">
	<h2>Profile</h2>
	<form
		class="space-y-4"
		method="post"
		use:enhance={disableSubmitterAndSetValidity(
			{ success: "Profile updated" },
			{ invalidateAll: true, reset: false },
		)}
	>
		<div class="form-control">
			<label for="username" class="label">
				<span class="label-text"> Username </span>
			</label>
			<div class="pile">
				<input
					id="username"
					type="text"
					name="username"
					class="input-bordered input w-full"
					placeholder="Choose your username"
					bind:value={username}
					oninput={() =>
						resetUsernameStatus(username, (status) => {
							usernameStatus = status;
						})}
					{...fg.splat(NewUserSchema["username"].attributes)}
					aria-errormessage="username-error"
					aria-invalid={!!form?.issues?.username}
					autocomplete="username"
					spellcheck="false"
				/>
				{#if username && (usernameStatus === "available" || (usernameStatus === "taken" && username === data.user.username))}
					<Icon name="check-circle" class="stroke-green-600 stroke-[1.5] z-10 ml-auto size-10 py-3"
					></Icon>
				{:else if username && (usernameStatus === "error" || (usernameStatus === "taken" && username !== data.user.username))}
					<Icon name="x-circle" class="stroke-red-600 stroke-[1.5] z-10 ml-auto size-10 py-3"
					></Icon>
				{:else if usernameStatus === "pending"}
					<CircularProgress class="stroke-current stroke-[6px] z-10 ml-auto size-10 py-[13px]"
					></CircularProgress>
				{/if}
			</div>
			{#if form?.issues?.username || (username && usernameStatus === "taken" && username !== data.user.username)}
				<span id="username-error" class="error-message">
					{form?.issues?.username?.message || "Username already taken"}
				</span>
			{/if}
		</div>

		<div class="form-control">
			<span class="label label-text"> Are you a teacher? </span>

			<span class="inline-flex gap-x-3 ml-2">
				<label>
					<input
						type="radio"
						name="isTeacher"
						class="radio"
						value="true"
						checked={data.user.isTeacher}
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
						checked={!data.user.isTeacher}
						{...fg.splat(NewUserSchema["isTeacher"].attributes)}
					/>
					<span> No </span>
				</label>
			</span>
			{#if form?.issues?.isTeacher}
				<span class="error-message">{form.issues.isTeacher.message}</span>
			{/if}
		</div>

		<p class="mt-8 flex justify-between">
			<a href="/logout" class="btn" data-sveltekit-preload-data="off" data-sveltekit-reload
				>Sign out</a
			>
			<button class="btn-neutral btn block">Update</button>
			{#if form?.issues || page.status !== 200}
				<span class="error-message mt-2">
					Something went wrong. {form?.issues
						? "Please correct the highlighted fields above"
						: "There was a network error. Please try again later"}
				</span>
			{/if}
		</p>
		<p></p>
	</form>
</article>
