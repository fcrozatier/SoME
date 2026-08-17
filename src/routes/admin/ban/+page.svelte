<script lang="ts">
	import { resetUsernameStatus, type UsernameStatus } from "$api/check-username/fetch.js";
	import { enhance } from "$app/forms";
	import { disableSubmitterAndSetValidity } from "$lib/actions.js";
	import CircularProgress from "$lib/components/icons/CircularProgress.svelte";
	import Icon from "$lib/components/icons/Icon.svelte";
	import { formatTitle } from "$lib/utils/formatting.js";

	let { form } = $props();

	let username: string = $state("");
	let usernameStatus: UsernameStatus = $state();

	let expiresAt: string = $state("");

	const isPermanent = $derived(!expiresAt);
	const formatDuration = $derived(!expiresAt ? "." : ` until ${expiresAt}.`);

	let message = $derived(
		`Your activity was flagged by admins. Your SoME account is suspended${formatDuration}
${isPermanent ? "Your past votes and entries have been removed." : ""}
You can no longer login, vote, or submit entries.`,
	);
</script>

<svelte:head>
	<title>{formatTitle("Ban User")}</title>
</svelte:head>

<article class="layout-prose max-w-2xl!">
	<h2>Ban User</h2>

	<form
		class="space-y-2"
		method="post"
		use:enhance={disableSubmitterAndSetValidity({
			toast: { success: { type: "info", content: `User banned` } },
			reset: true,
		})}
	>
		<div class="form-control">
			<label for="username" class="label">
				<span class="label-text">Username</span>
			</label>
			<div class="flex items-center gap-2">
				<div class="pile w-full">
					<input
						id="username"
						type="text"
						name="username"
						placeholder="User to ban"
						class="input-bordered input w-full"
						bind:value={username}
						oninput={(e) =>
							resetUsernameStatus(e.currentTarget.value, (status) => {
								usernameStatus = status;
							})}
						required
					/>
					{#if username && usernameStatus === "taken"}
						<Icon
							name="check-circle"
							class="stroke-green-600 stroke-[1.5] z-10 ml-auto size-10 py-3"
						></Icon>
					{:else if username && (usernameStatus === "error" || usernameStatus === "available")}
						<Icon name="x-circle" class="stroke-red-600 stroke-[1.5] z-10 ml-auto size-10 py-3"
						></Icon>
					{:else if usernameStatus === "pending"}
						<CircularProgress class="stroke-current stroke-[6px] z-10 ml-auto size-10 py-3.25"
						></CircularProgress>
					{/if}
				</div>
			</div>
			{#if username && usernameStatus === "available"}
				<span id="username-error" class="error-message">
					User "{username}" not found. Please check for typos.
				</span>
			{/if}
		</div>

		{#if form?.issues?.username}
			<span class="block error-message">{form.issues.username.message}</span>
		{/if}

		<div class="form-control">
			<label for="expiresAt" class="label">Expires At</label>
			<p class="mt-2 mb-4">The ban expiration if any. Leave empty for permanent bans</p>
			<input
				id="expiresAt"
				type="date"
				name="expiresAt"
				min={new Date().toISOString().slice(0, 10)}
				class="input-bordered input w-full"
				aria-errormessage="expiresAt-error"
				aria-invalid={!!form?.issues?.expiresAt}
				bind:value={expiresAt}
			/>
			{#if form?.issues?.expiresAt}
				<span id="expiresAt-error" class="error-message">{form.issues.expiresAt.message}</span>
			{/if}
		</div>

		<div class="form-control">
			<label for="reason" class="label">Reason (internal)</label>
			<input
				id="reason"
				type="text"
				name="reason"
				placeholder=""
				class="input-bordered input w-full"
				aria-errormessage="reason-error"
				aria-invalid={!!form?.issues?.reason}
				required
			/>
			{#if form?.issues?.reason}
				<span id="reason-error" class="error-message">{form.issues.reason.message}</span>
			{/if}
		</div>

		<div class="form-control">
			<label for="message" class="label">
				<span class="label-text">Message (email)</span>
			</label>
			<textarea
				id="message"
				name="message"
				placeholder="message of your entry, audience..."
				class="textarea-bordered block w-full textarea text-base min-h-[8lh]"
				aria-errormessage="message-error"
				aria-invalid={!!form?.issues?.message}
				bind:value={message}
				required
			></textarea>

			{#if form?.issues?.message}
				<span id="message-error" class="error-message">{form.issues.message.message}</span>
			{/if}
		</div>

		<p>
			<button class="btn-neutral btn block"> Ban User</button>
		</p>
	</form>
</article>

<style>
	label {
		margin-top: calc(var(--spacing) * 2);
	}
</style>
