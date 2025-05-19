<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/state";
	import { categories, FULL_NAME } from "$lib/config";
	import { setTitle, slugify, YOUTUBE_EMBEDDABLE } from "$lib/utils";
	import { NewEntrySchema } from "$lib/validation";
	import * as fg from "formgator";
	import { tick } from "svelte";

	let { form } = $props();

	export const snapshot = {
		capture: () => {
			return {
				usernames,
				category,
				title,
				description,
				link,
			};
		},
		restore: (v) => {
			usernames = v.usernames;
			category = v.category;
			title = v.title;
			description = v.description;
			link = v.link;
		},
	};

	let usernames: string[] = $state([]);
	let category = $state("");
	let title = $state("");
	let description = $state("");
	let tag = $state("");
	let tags: string[] = $state([]);
	let link = $state("");

	const levels = [
		"k-level",
		"middle-school",
		"high-school",
		"undergraduate",
		"masters",
		"doctoral",
	];

	async function addContributor() {
		usernames = [...usernames, ""];
		await tick();
		const lastUsername = document.getElementById(`username-${usernames.length - 1}`);
		(lastUsername as HTMLInputElement)?.focus();
	}

	setTitle("New entry");
</script>

<article class="layout-prose">
	<h2>Submit a new entry</h2>

	<form
		class="space-y-2"
		method="post"
		enctype="multipart/form-data"
		use:enhance={({ submitter, formData }) => {
			submitter?.setAttribute("disabled", "on");

			return async ({ update }) => {
				await update();
				submitter?.removeAttribute("disabled");
			};
		}}
	>
		{#each usernames as _, i}
			<div class="form-control max-w-md">
				<label for="username-{i}" class="label">
					<span class="label-text">Username {i + 1}</span>
				</label>
				<div class="flex items-center gap-2">
					<input
						id="username-{i}"
						type="text"
						name="usernames"
						placeholder="The SoME username of a member of your team"
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
				Add contributor
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

		<div class="form-control max-w-md">
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

		<div class="form-control max-w-md">
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

		<div class="form-control max-w-md">
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
				aria-invalid={!!form?.issues?.title}
				{...fg.splat(NewEntrySchema["description"].attributes)}
			></textarea>

			{#if form?.issues?.description}
				<span id="title-error" class="error-message">{form.issues.description.message}</span>
			{/if}

			<div class="label">
				<span class="label-text-alt">{description.length}/5000</span>
			</div>
		</div>

		<div class="form-control max-w-md">
			<label for="new-tag" class="label"> Tags </label>

			<p class="mt-2 mb-4">
				Add tags to your entry for simple categorization, such as topic and level. For the topic,
				choose a relevant theme, concept or chapter if applicable. For the level, you can pick from
				the following list:
			</p>
			<div class="flex flex-wrap gap-2 mb-6">
				{#each levels as level}
					<button
						class={`btn btn-xs badge badge-sm badge-neutral badge-outline  ${tags.includes(level) ? "bg-black text-white" : ""}`}
						type="button"
						onclick={() => {
							if (tags.includes(level)) {
								tags = tags.filter((t) => t !== level);
							} else {
								tags.push(level);
							}
						}}
					>
						{level}
					</button>
				{/each}
			</div>
			<input
				id="new-tag"
				type="text"
				name="new-tag"
				placeholder="Comma separated tags"
				class="input-bordered input w-full"
				aria-errormessage="title-error"
				aria-invalid={!!form?.issues?.newTag}
				bind:value={tag}
				onkeydown={(event) => {
					if (event.key === "Enter" || event.key === ",") {
						if (event.currentTarget.value.length) {
							tags.push(slugify(event.currentTarget.value));
							tag = "";
							event.preventDefault();
						}
					}
				}}
				{...fg.splat(NewEntrySchema["newTag"].attributes)}
			/>

			{#if form?.issues?.description}
				<span id="title-error" class="error-message">{form.issues.description.message}</span>
			{/if}
		</div>
		<div class="flex gap-2">
			{#each tags as tag, i}
				<span class="badge badge-sm badge-neutral badge-outline">
					{tag}
					<button
						type="button"
						class="cursor-pointer"
						onclick={() => {
							tags.splice(i, 1);
						}}>&cross;</button
					>
				</span>
			{/each}
		</div>

		<div class="form-control max-w-md">
			<label for="link" class="label">
				<span class="label-text"> Link </span>
			</label>
			<input
				id="link"
				type="url"
				name="link"
				placeholder="https://"
				class="input-bordered input w-full"
				bind:value={link}
				{...fg.splat(NewEntrySchema["link"].attributes)}
			/>
			{#if form?.issues?.link}
				<span class="error-message">{form.issues.link.message}</span>
			{/if}
		</div>

		{#if link && !YOUTUBE_EMBEDDABLE.test(link)}
			<div class="form-control max-w-md">
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
					required
				/>
				{#if form?.issues?.thumbnail}
					<span class="error-message">{form.issues.thumbnail.message} </span>
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
			{#if form?.issues?.rules}
				<span class="error-message">{form.issues.rules.message}</span>
			{/if}
		</div>

		<div class="form-control max-w-md">
			<label class="label items-start justify-normal gap-4">
				<input type="checkbox" name="copyright" class="checkbox" required />
			</label>
			I have permission to use all material contained in my submission for the {FULL_NAME}.
			<ul class="relative right-6 list-outside">
				<li>
					<a href="/content-policy#fair-use">Copyrighted material policy and fair use guidelines</a>
				</li>
				<li><a href="/content-policy#cc">Creative Commons guidelines</a></li>
				<li><a href="/content-policy#ai">AI policy</a></li>
			</ul>
			{#if form?.issues?.copyright}
				<span class="error-message">{form.issues.copyright.message} </span>
			{/if}
		</div>

		<p>
			<button class="btn-neutral btn block"> Submit </button>
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
