<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/state";
	import { PUBLIC_S3_BUCKET, PUBLIC_S3_ENDPOINT } from "$env/static/public";
	import { newToast } from "$lib/components/Toasts.svelte";
	import { categories } from "$lib/config";
	import { YOUTUBE_EMBEDDABLE } from "$lib/utils/regex.js";
	import { setTitle } from "$lib/utils/setTitle.js";
	import { slugify } from "$lib/utils/slugify.js";
	import { invalidTagsMessage, levels, NewEntrySchema } from "$lib/validation";
	import * as fg from "formgator";
	import { tick } from "svelte";
	import { SvelteSet } from "svelte/reactivity";

	let { form, data } = $props();

	export const snapshot = {
		capture: () => {
			return {
				usernames,
				category,
				title,
				description,
				url,
			};
		},
		restore: (v) => {
			usernames = v.usernames;
			category = v.category;
			title = v.title;
			description = v.description;
			url = v.url;
		},
	};

	const entry = data.entry;

	let usernames: string[] = $state(data.coauthors);
	let category = $state(entry.category);
	let title = $state(entry.title);
	let description = $state(entry.description);
	let url = $state(entry.url);
	let tag = $state("");
	let tags: string[] = $state(data.tags);
	let invalidTags = $derived(new SvelteSet(tags).intersection(new Set(levels)).size === 0);
	let newtag: HTMLInputElement | undefined = $state();
	let showInvalidTagsMessage = $state(false);
	let invalidTagReason = $state("");

	$effect(() => {
		// The level was not provided
		if (invalidTags) newtag?.setCustomValidity(invalidTagsMessage);
		else newtag?.setCustomValidity("");
	});

	async function addContributor() {
		usernames.push("");
		await tick();
		const lastUsername = document.getElementById(`username-${usernames.length - 1}`);
		(lastUsername as HTMLInputElement)?.focus();
	}

	setTitle("New entry");
</script>

<article class="layout-prose max-w-2xl!">
	<h2>Update an entry</h2>

	<form
		class="space-y-2"
		method="post"
		enctype="multipart/form-data"
		use:enhance={({ submitter }) => {
			submitter?.setAttribute("disabled", "on");

			return async ({ update, result, formElement }) => {
				await update();
				submitter?.removeAttribute("disabled");

				if (result.type === "failure" && typeof result.data?.issues === "object") {
					const issues = result.data.issues as Record<string, fg.ValidationIssue>;

					for (const element of formElement.elements) {
						if (
							!(element instanceof HTMLInputElement) &&
							!(element instanceof HTMLTextAreaElement) &&
							!(element instanceof HTMLSelectElement)
						) {
							continue;
						}

						const customMessage = issues[element.name]?.message;
						if (customMessage) element.setCustomValidity(customMessage);
						element.reportValidity();

						element.addEventListener("input", () => element.setCustomValidity(""), {
							once: true,
						});
					}
				}

				if (result.type === "redirect") {
					newToast({ type: "success", content: `Entry updated!` });
				}
			};
		}}
	>
		{#each usernames as _, i}
			<div class="form-control">
				<label for="username-{i}" class="label">
					<span class="label-text">Coauthor {i + 1}</span>
				</label>
				<div class="flex items-center gap-2">
					<input
						id="username-{i}"
						type="text"
						name="usernames"
						placeholder="The SoME username of a coauthor"
						class="input-bordered input w-full"
						bind:value={usernames[i]}
						required
					/>
					<button
						type="button"
						class="btn-outline btn-xs btn-circle btn opacity-80"
						onclick={() => {
							usernames.splice(i, 1);
							usernames = usernames;
						}}>&cross;</button
					>
				</div>
			</div>
		{/each}
		<div>
			<label class="inline-flex items-center gap-2 text-sm text-gray-500">
				Add coauthor
				<button
					type="button"
					class="btn-outline btn-sm btn-circle btn opacity-80"
					onclick={addContributor}>+</button
				>
			</label>
		</div>
		{#if form?.issues?.usernames}
			<span class="block error-message">{form.issues.usernames.message}</span>
		{/if}

		<div class="form-control">
			<label for="category" class="label">
				<span class="label-text"> Category </span>
			</label>
			<select
				id="category"
				name="category"
				class="select-bordered select w-full"
				bind:value={category}
				{...fg.splat(NewEntrySchema["category"].attributes)}
			>
				{#each categories as category}
					<option value={category}>{category}</option>
				{/each}
			</select>
			{#if form?.issues?.category}
				<span class="error-message">{form.issues.category.message}</span>
			{/if}
		</div>

		<div class="form-control">
			<label for="title" class="label">Title</label>
			<input
				id="title"
				type="text"
				name="title"
				placeholder="The title of your entry"
				class="input-bordered input w-full"
				aria-errormessage="title-error"
				aria-invalid={!!form?.issues?.title}
				bind:value={title}
				{...fg.splat(NewEntrySchema["title"].attributes)}
			/>
			{#if form?.issues?.title}
				<span id="title-error" class="error-message">{form.issues.title.message}</span>
			{/if}
		</div>

		<div class="form-control">
			<label for="description" class="label">
				<span class="label-text">Description</span>
			</label>
			<textarea
				id="description"
				name="description"
				placeholder="Description of your entry, audience..."
				class="textarea-bordered block w-full textarea text-base"
				rows="8"
				bind:value={description}
				aria-errormessage="description-error"
				aria-invalid={!!form?.issues?.description}
				{...fg.splat(NewEntrySchema["description"].attributes)}
			></textarea>

			{#if form?.issues?.description}
				<span id="description-error" class="error-message">{form.issues.description.message}</span>
			{/if}

			<div class="label">
				<span class="label-text-alt">{description.length}/5000</span>
			</div>
		</div>

		<div class="form-control">
			<label for="new-tag" class="label"> Tags </label>

			<p class="mt-2 mb-4">
				Add tags to your entry for simple categorization, such as topic and level. For the topic,
				choose a relevant theme, concept or chapter if applicable. For the level, you can pick from
				the following list:
			</p>
			<div class="flex flex-wrap gap-2 mb-6">
				{#each levels as level}
					<button
						class={`tag cursor-pointer  ${tags.includes(level) ? "bg-gray-900 border-gray-900 text-white" : ""}`}
						type="button"
						onclick={() => {
							if (tags.includes(level)) {
								tags = tags.filter((t) => t !== level);
							} else {
								tags.push(level);
							}
							showInvalidTagsMessage = true;
						}}
					>
						{level}
					</button>
				{/each}
			</div>
			<input
				id="newtag"
				type="text"
				name="newtag"
				placeholder="Comma separated tags (letters and dash only)"
				class="input-bordered input w-full"
				aria-errormessage="newtag-error"
				aria-invalid={`${invalidTags}`}
				bind:value={tag}
				bind:this={newtag}
				onkeydown={async (event) => {
					if (event.key === "Enter" || event.key === ",") {
						if (tag.length) {
							const res = await fetch(`/api/check-tag`, {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({ tag }),
							});
							const { valid, reason }: { valid: boolean; reason?: string } = await res.json();

							if (valid) {
								invalidTagReason = "";
								tags.push(slugify(tag));
								showInvalidTagsMessage = true;
								tag = "";
							} else if (reason) {
								invalidTagReason = reason;
							}
							event.preventDefault();
						}
					}
				}}
			/>

			{#if invalidTags && showInvalidTagsMessage}
				<span id="newtag-error" class="error-message">{invalidTagsMessage}</span>
			{/if}
		</div>
		<div class="flex gap-2">
			{#each tags as tag}
				<input type="hidden" value={tag} name="tag" />
				<span class="tag">
					{tag}
					<button
						type="button"
						class="cursor-pointer"
						onclick={() => {
							showInvalidTagsMessage = true;
							tags = tags.filter((t) => t !== tag);
						}}>&cross;</button
					>
				</span>
			{/each}
		</div>
		{#if form?.issues?.tag || invalidTagReason}
			<span class="error-message">{form?.issues?.tag?.message || invalidTagReason}</span>
		{/if}

		<div class="form-control">
			<label for="url" class="label">
				<span class="label-text"> Link </span>
			</label>
			<input
				id="url"
				type="url"
				name="url"
				placeholder="https://"
				class="input-bordered input w-full"
				aria-errormessage="url-error"
				aria-invalid={!!form?.issues?.url}
				bind:value={url}
				{...fg.splat(NewEntrySchema["url"].attributes)}
			/>
			{#if form?.issues?.url}
				<span id="url-error" class="error-message">{form.issues.url.message}</span>
			{/if}
		</div>

		{#if url && !YOUTUBE_EMBEDDABLE.test(url)}
			<div>
				<p>Current thumbnail</p>
				<img
					class="my-0 max-w-full rounded-lg"
					src={`https://${PUBLIC_S3_BUCKET}.${PUBLIC_S3_ENDPOINT.replace("https://", "")}/${entry.thumbnail}`}
					alt="thumbnail"
					width="480"
					height="270"
				/>
			</div>

			<div class="form-control">
				<label for="thumbnail" class="label flex justify-between">
					<span class="label-text">Thumbnail</span>
					<span class="label-text-alt">Recommended ratio 16:9</span>
				</label>
				<input
					id="thumbnail"
					type="file"
					accept="image/*"
					name="thumbnail"
					class="file-input w-full input-bordered"
				/>
				{#if form?.issues?.thumbnail}
					<span class="error-message">{form.issues.thumbnail.message} </span>
				{/if}
			</div>
		{/if}

		<div class="form-control">
			<label for="rules" class="label gap-4">
				<input id="rules" type="checkbox" name="rules" class="checkbox" required />
				<span class="label-text">
					I've read the <a href="/rules">rules</a> of the competition
				</span>
			</label>
			{#if form?.issues?.rules}
				<span class="error-message">{form.issues.rules.message}</span>
			{/if}
		</div>

		<div class="form-control">
			<label class="label gap-4">
				<input type="checkbox" name="copyright" class="checkbox" required />
				I agree to the following policies:
			</label>
			<ul class="list-outside ml-2 mt-0">
				<li>
					<a href="/content-policy#fair-use">Copyrighted Material Policy</a>
				</li>
				<li><a href="/content-policy#cc">Creative Commons Guidelines</a></li>
				<li><a href="/content-policy#ai">AI Content Policy</a></li>
			</ul>
			{#if form?.issues?.copyright}
				<span class="error-message">{form.issues.copyright.message} </span>
			{/if}
		</div>

		<p>
			<button class="btn-neutral btn block"> Update Entry</button>
			{#if form?.issues || page.status !== 200}
				<span class="error-message mt-2">
					Something went wrong. {form?.issues
						? "Please correct the highlighted fields above"
						: "There was a network error. Please try again later"}
				</span>
			{/if}
		</p>
	</form>
</article>

<style>
	label {
		margin-top: calc(var(--spacing) * 2);
	}
</style>
