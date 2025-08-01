<script lang="ts">
	import { resetUsernameStatus, type UsernameStatus } from "$api/check-username/fetch.js";
	import { enhance } from "$app/forms";
	import { page } from "$app/state";
	import { PUBLIC_S3_BUCKET, PUBLIC_S3_ENDPOINT } from "$env/static/public";
	import { reportValidity } from "$lib/actions.js";
	import CircularProgress from "$lib/components/icons/CircularProgress.svelte";
	import Icon from "$lib/components/icons/Icon.svelte";
	import { newToast } from "$lib/components/Toasts.svelte";
	import { makeTitle } from "$lib/utils/makeTitle.js";
	import { YOUTUBE_EMBEDDABLE } from "$lib/utils/regex.js";
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
	let usernameStatuses: UsernameStatus[] = $state([]);
	let category = $state(entry.category);
	let title = $state(entry.title);
	let description = $state(entry.description);
	let url = $state(entry.url);
	let tag = $state("");
	let tags: Set<string> = $state(new SvelteSet(data.tags));
	let invalidTags = $derived(tags.intersection(new Set(levels)).size === 0);
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
		usernameStatuses.push(undefined);
		await tick();
		const lastUsername = document.getElementById(`username-${usernames.length - 1}`);
		(lastUsername as HTMLInputElement)?.focus();
	}
</script>

<svelte:head>
	<title>{makeTitle("New Entry")}</title>
</svelte:head>

{#snippet input()}
	<button><selectedcontent></selectedcontent></button>
{/snippet}
{#snippet iconVideo()}
	<Icon name="video" class="icon size-6" /> video
{/snippet}
{#snippet iconNonVideo()}
	<Icon name="file-text" class="size-6" /> non-video
{/snippet}

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
				reportValidity({ result, formElement });

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
					<div class="pile w-full">
						<input
							id="username-{i}"
							type="text"
							name="usernames"
							placeholder="The SoME username of a coauthor"
							class="input-bordered input w-full"
							bind:value={usernames[i]}
							oninput={(e) =>
								resetUsernameStatus(e.currentTarget.value, (status) => {
									usernameStatuses[i] = status;
								})}
							required
						/>
						{#if usernames[i] && usernameStatuses[i] === "taken"}
							<Icon
								name="check-circle"
								class="stroke-green-600 stroke-[1.5] z-10 ml-auto size-10 py-3"
							></Icon>
						{:else if usernames[i] && (usernameStatuses[i] === "error" || usernameStatuses[i] === "available")}
							<Icon name="x-circle" class="stroke-red-600 stroke-[1.5] z-10 ml-auto size-10 py-3"
							></Icon>
						{:else if usernameStatuses[i] === "pending"}
							<CircularProgress class="stroke-current stroke-[6px] z-10 ml-auto size-10 py-[13px]"
							></CircularProgress>
						{/if}
					</div>
					<button
						type="button"
						class="btn btn-outline btn-xs btn-circle hover:btn-neutral"
						onclick={() => {
							usernames.splice(i, 1);
							usernameStatuses.splice(i, 1);
						}}>&cross;</button
					>
				</div>
				{#if usernames[i] && usernameStatuses[i] === "available"}
					<span id="username-error" class="error-message">
						We couldn’t find a coauthor with the username "{usernames[i]}". Please check for typos.
					</span>
				{/if}
			</div>
		{/each}
		<div>
			<label class="inline-flex items-center gap-2 text-sm">
				Add coauthor
				<button
					type="button"
					class="btn btn-outline btn-sm btn-circle hover:btn-neutral"
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
				{@render input()}
				<option value={"video"} onclick={() => (category = "video")}>{@render iconVideo()}</option>
				<option value={"non-video"} onclick={() => (category = "non-video")}
					>{@render iconNonVideo()}</option
				>
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
						class={`tag cursor-pointer  ${tags.has(level) ? "bg-gray-900 border-gray-900 text-white" : ""}`}
						type="button"
						onclick={() => {
							if (tags.has(level)) {
								tags.delete(level);
							} else {
								tags.add(level);
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
				onkeyup={(e) => {
					if (e.key === ",") {
						tag = "";
					}
				}}
				onkeydown={async (event) => {
					if (event.key === "Enter" || event.key === ",") {
						if (tag.length) {
							const check = tag;
							tags.add(slugify(tag));
							showInvalidTagsMessage = true;

							const res = await fetch(`/api/check-tag`, {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({ tag: check }),
							});
							const { valid, reason }: { valid: boolean; reason?: string } = await res.json();

							if (valid) {
								invalidTagReason = "";
							} else if (reason) {
								tags.delete(check);
								tag = check;
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
		<div class="flex flex-wrap gap-2">
			{#each tags as tag}
				<input type="hidden" value={tag} name="tag" />
				<span class="tag">
					{tag}
					<button
						type="button"
						class="cursor-pointer"
						onclick={() => {
							showInvalidTagsMessage = true;
							tags.delete(tag);
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
