<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/state";
	import { PUBLIC_S3_BUCKET, PUBLIC_S3_ENDPOINT } from "$env/static/public";
	import { newToast } from "$lib/components/Toasts.svelte";
	import { COMPETITION_FULL_NAME, COMPETITION_SHORT_NAME, categories } from "$lib/config";
	import { YOUTUBE_EMBEDDABLE, registrationOpen } from "$lib/utils";
	import { tick } from "svelte";

	let { data, form } = $props();

	export const snapshot = {
		capture: () => {
			return {
				email,
				otherContributors,
				category,
				title,
				description,
				link,
			};
		},
		restore: (v) => {
			email = v.email;
			otherContributors = v.otherContributors;
			category = v.category;
			title = v.title;
			description = v.description;
			link = v.link;
		},
	};

	let email = $state(data.emails[0]);
	let otherContributors = $state(data.emails.slice(1));
	let category = $state(data.category);
	let title = $state(data.title);
	let description = $state(data.description);
	let link = $state(data.url);

	async function addContributor() {
		otherContributors = [...otherContributors, ""];
		await tick();
		const lastEmail = document.getElementById(`email-${otherContributors.length - 1}`);
		(lastEmail as HTMLInputElement)?.focus();
	}
</script>

<svelte:head>
	<title>Update &middot; {COMPETITION_SHORT_NAME}</title>
</svelte:head>

<article class="layout-prose">
	<h2>Update your entry</h2>

	<p>You can update your entry at any time during the registration period.</p>
	<form
		method="post"
		enctype="multipart/form-data"
		use:enhance={async ({ submitter, formData }) => {
			formData.append("others", JSON.stringify(otherContributors));
			formData.set("userType", "creator");
			submitter?.setAttribute("disabled", "on");

			return async ({ update, result }) => {
				if (result.type === "success") {
					newToast({ content: "Entry updated!", type: "success" });
				}
				await update({ reset: false });
				submitter?.removeAttribute("disabled");
			};
		}}
	>
		<div class="form-control max-w-md">
			<label for="email" class="label">
				<span class="label-text"> Email </span>
			</label>
			<input
				id="email"
				type="email"
				name="email"
				placeholder="john@gmail.com"
				class="input-bordered input w-full"
				bind:value={email}
				required
			/>
			{#if form?.fieldErrors?.email}
				<span class="block text-error">{form.fieldErrors.email.join(", ")}</span>
			{/if}
		</div>

		{#each otherContributors as _, i}
			<div class="form-control max-w-md">
				<label for="email-{i}" class="label">
					<span class="label-text">Email {i + 2}</span>
				</label>
				<div class="flex items-center gap-2">
					<input
						id="email-{i}"
						type="email"
						name="email_{i}"
						class="input-bordered input w-full"
						bind:value={otherContributors[i]}
						required
					/>
					<button
						type="button"
						class="btn-outline btn-xs btn-circle btn opacity-80"
						onclick={() => {
							otherContributors.splice(i, 1);
							otherContributors = otherContributors;
						}}>&cross;</button
					>
				</div>
			</div>
		{/each}
		<p class="flex items-center gap-2 text-sm text-gray-500">
			Add contributor
			<button
				type="button"
				class="btn-outline btn-sm btn-circle btn opacity-80"
				onclick={addContributor}
			>
				+</button
			>
		</p>

		{#if form?.undeliverable}
			<span class="block text-error"
				>undeliverable email{otherContributors.length > 0 ? ": " + form.undeliverable : ""}</span
			>
		{/if}

		<div class="form-control max-w-md">
			<label for="category" class="label">
				<span class="label-text"> Category </span>
			</label>
			<select
				id="category"
				name="category"
				class="select-bordered select w-full"
				bind:value={category}
				required
			>
				{#each categories as category}
					<option value={category}>{category}</option>
				{/each}
			</select>
			{#if form?.fieldErrors?.category}
				<span class="block text-error">{form.fieldErrors.category.join(", ")}</span>
			{/if}
		</div>

		<div class="form-control max-w-md">
			<label for="title" class="label">
				<span class="label-text">Title</span>
			</label>
			<input
				id="title"
				type="text"
				name="title"
				class="input-bordered input w-full"
				bind:value={title}
				required
			/>
			{#if form?.fieldErrors?.title}
				<span class="block text-error">{form.fieldErrors.title.join(", ")}</span>
			{/if}
		</div>

		<div class="form-control max-w-md">
			<label for="description" class="label">
				<span class="label-text">Description</span>
			</label>
			<textarea
				id="description"
				name="description"
				class="textarea-bordered textarea text-base"
				minlength="10"
				maxlength="5000"
				rows="8"
				bind:value={description}
				required
			></textarea>
			<div class="label">
				<span class="label-text-alt text-error">
					{#if form?.fieldErrors?.description}
						{form.fieldErrors.description.join(", ")}
					{/if}
				</span>
				<span class="label-text-alt">{description.length}/5000</span>
			</div>
		</div>

		<div class="form-control max-w-md">
			<label for="link" class="label">
				<span class="label-text"> Link </span>
			</label>
			{#if !registrationOpen()}
				<input type="hidden" name="link" value={link} />
			{/if}
			<input
				id="link"
				type="url"
				name="link"
				placeholder="https://"
				class="input-bordered input w-full"
				bind:value={link}
				disabled={!registrationOpen()}
			/>
			{#if form?.fieldErrors?.link}
				<span class="block text-error">{form.fieldErrors.link.join(", ")} </span>
			{:else if form?.linkExists}
				<span class="block text-error">entry already registered</span>
			{/if}
		</div>

		<div>
			{#if !YOUTUBE_EMBEDDABLE.test(data.url)}
				<p>Current thumbnail</p>
				<img
					class="my-0 max-w-full rounded-lg"
					src={`https://${PUBLIC_S3_BUCKET}.${PUBLIC_S3_ENDPOINT.replace("https://", "")}/${data.thumbnail}`}
					alt="thumbnail"
					width="480"
					height="270"
				/>
			{/if}
		</div>

		{#if link && !YOUTUBE_EMBEDDABLE.test(link)}
			<div class="form-control max-w-md">
				<label for="thumbnail" class="label">
					<span class="label-text">Thumbnail</span>
					<span class="label-text-alt">Recommended ratio 16:9</span>
				</label>
				<input
					id="thumbnail"
					type="file"
					accept="image/*"
					name="thumbnail"
					class="file-input input-bordered"
					required
				/>
				{#if form?.fieldErrors?.thumbnail}
					<span class="block text-error">{form.fieldErrors.thumbnail.join(", ")} </span>
				{:else if form?.thumbnailRequired}
					<span class="block text-error">A thumbnail is required</span>
				{/if}
			</div>
		{/if}

		<div class="form-control max-w-md">
			<label for="rules" class="label justify-normal gap-4">
				<input id="rules" type="checkbox" name="rules" class="checkbox" required />
				<span class="label-text">
					I've read the <a href="/rules">rules</a> of the competition
				</span>
			</label>
			{#if form?.fieldErrors?.rules}
				<span class="block text-error">{form.fieldErrors.rules.join(", ")} </span>
			{/if}
		</div>

		<div class="form-control max-w-md">
			<label for="copyright" class="label items-start justify-normal gap-4">
				<input id="copyright" type="checkbox" name="copyright" class="checkbox" required />
				<span class="label-text">
					I have permission to use all material contained in my submission for the {COMPETITION_FULL_NAME}.
					<ul class="relative right-6 list-outside">
						<li>
							<a href="/content-policy#fair-use"
								>Copyrighted material policy and fair use guidelines</a
							>
						</li>
						<li><a href="/content-policy#cc">Creative Commons guidelines</a></li>
						<li><a href="/content-policy#ai">AI policy</a></li>
					</ul>
				</span>
			</label>
			{#if form?.fieldErrors?.copyright}
				<span class="block text-error">{form.fieldErrors.copyright.join(", ")} </span>
			{/if}
		</div>

		{#if form?.fieldErrors || page.status !== 200}
			<p class="block text-error">
				Something went wrong. {form?.message || ""}
			</p>
		{/if}
		<p>
			<button class="btn-neutral btn block"> Submit </button>
		</p>
		<p class="text-sm">
			<a href="/gdpr">Privacy policy</a>
		</p>
	</form>
</article>

<style>
	label {
		margin-top: var(--spacing-2);
	}
</style>
