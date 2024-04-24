<script lang="ts">
	import { enhance } from '$app/forms';
	import type { EntryProperties } from '$lib/server/neo4j';
	import { categories } from '$lib/config.js';
	import { YOUTUBE_EMBEDDABLE, voteOpen } from '$lib/utils.js';
	import { PUBLIC_S3_BUCKET, PUBLIC_S3_ENDPOINT } from '$env/static/public';

	export let form;

	$: entry = form?.entry as EntryProperties;

	let email = '';
	let link: string | undefined = undefined;

	function updateLink(e: Event) {
		link = (e.target as HTMLInputElement).value;
	}
</script>

<article class="layout-prose">
	<h2>Swap entries</h2>
	<form
		class="space-y-4"
		action="?/find"
		method="post"
		use:enhance={({ submitter }) => {
			submitter?.setAttribute('disabled', 'on');

			return async ({ update }) => {
				await update({ reset: false });
				submitter?.removeAttribute('disabled');
			};
		}}
	>
		<div class="form-control max-w-md">
			<label for="email"><span class="label-text">Creator email</span></label>
			<input id="email" type="email" class="input-bordered input" name="email" bind:value={email} />
		</div>
		<div>
			<button class="btn-primary btn">Find</button>
			{#if form?.creatorNotFound}
				<p class="text-error">Creator not found</p>
			{/if}
		</div>
	</form>

	{#if entry}
		<h3>Entry data</h3>
		<form
			method="post"
			action="?/swap"
			enctype="multipart/form-data"
			use:enhance={({ submitter }) => {
				submitter?.setAttribute('disabled', 'on');

				return async ({ update }) => {
					await update();
					submitter?.removeAttribute('disabled');
				};
			}}
		>
			{#if voteOpen()}
				<p>The category cannot be changed as the vote is open</p>
				<input type="hidden" name="category" value={entry.category} />
			{/if}
			<div class="form-control max-w-md">
				<span class="label-text"> Category </span>
				{#each categories as category, i}
					<label for="category-{i}" class="label cursor-pointer justify-start gap-2">
						<input
							id="category-{i}"
							class="radio"
							type="radio"
							name="category"
							value={category}
							checked={category === entry.category}
							required
							disabled={voteOpen()}
						/>
						<span class="label-text capitalize"> {category} </span>
					</label>
				{/each}
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
					value={entry.title}
					required
				/>
			</div>

			<div class="form-control max-w-md">
				<label for="description" class="label">
					<span class="label-text">Short description</span>
				</label>
				<textarea
					id="description"
					name="description"
					class="textarea-bordered textarea text-base"
					minlength="10"
					maxlength="500"
					rows="10"
					value={entry.description}
					required
				/>
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
					value={entry.link}
					on:input={updateLink}
					required
				/>
				{#if form?.ID === 'swap' && form?.linkExists}
					<span class="block text-error">entry already registered</span>
				{/if}
			</div>

			{#key link}
				{#if !YOUTUBE_EMBEDDABLE.test(link ?? entry.link)}
					{#if !link || link === entry.link}
						<p>Optional thumbnail: if not provided the old thumbnail will be used</p>
					{/if}
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
							required={!!link && link !== entry.link}
						/>
					</div>
				{/if}
			{/key}

			<div>
				<p>Current thumbnail</p>
				{#if YOUTUBE_EMBEDDABLE.test(entry.link)}
					{@const youtubeLink = entry.link.match(YOUTUBE_EMBEDDABLE)?.[1]}
					<iframe
						class="max-w-full rounded-lg"
						width="480"
						height="270"
						src={`https://www.youtube.com/embed/${youtubeLink}`}
						title="YouTube video player"
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowfullscreen
					/>
				{:else}
					<a href={entry.link} target="_blank">
						<img
							class="my-0 max-w-full rounded-lg"
							src={`https://${PUBLIC_S3_BUCKET}.${PUBLIC_S3_ENDPOINT.replace('https://', '')}/${
								entry.thumbnail
							}`}
							alt="thumbnail"
							width="480"
							height="270"
						/>
					</a>
				{/if}
			</div>

			<input type="hidden" name="oldLink" value={entry.link} />
			<input type="hidden" name="email" bind:value={email} />

			<div>
				<p>
					<strong>
						Swapping will create a new entry replacing the old one, and will delete all the previous
						votes and feedbacks.
					</strong>
				</p>
				<p>
					<button class="btn-error btn block">Swap entries</button>
				</p>
			</div>
		</form>
	{/if}
	{#if form?.errors}
		<p class="text-error">Something went wrong. Please try again</p>
		{#each Object.entries(form.errors) as [key, value]}
			<span class="text-error">{key}: {value}</span>
		{/each}
	{/if}
	{#if form?.error_message}
		<p class="text-error">Something went wrong. Please try again</p>
		<span class="text-error">{form.error_message}</span>
	{/if}
</article>
