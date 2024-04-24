<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { YOUTUBE_EMBEDDABLE, registrationOpen } from '$lib/utils';
	import {
		COMPETITION_FULL_NAME,
		COMPETITION_SHORT_NAME,
		categories,
		userTypes
	} from '$lib/config';
	import type { Snapshot } from './$types';
	import { tick } from 'svelte';
	import Time from '$lib/components/Time.svelte';
	import { PUBLIC_REGISTRATION_END } from '$env/static/public';

	export let form;

	export const snapshot: Snapshot = {
		capture: () => {
			return {
				userType,
				email,
				otherContributors,
				category,
				title,
				description,
				link
			};
		},
		restore: (v) => {
			userType = v.userType;
			email = v.email;
			otherContributors = v.otherContributors;
			category = v.category;
			title = v.title;
			description = v.description;
			link = v.link;
		}
	};

	let userType: (typeof userTypes)[number];
	let email: string;
	let otherContributors: string[] = [];
	let category: string;
	let title: string;
	let description = '';
	let link: string;

	async function addContributor() {
		otherContributors = [...otherContributors, ''];
		await tick();
		const lastEmail = document.getElementById(`email-${otherContributors.length - 1}`);
		(lastEmail as HTMLInputElement)?.focus();
	}
</script>

<svelte:head>
	<title>Join &middot; {COMPETITION_SHORT_NAME}</title>
</svelte:head>

<article class="layout-prose">
	{#if form?.success}
		<h2>Thank you for participating!</h2>
		{#if otherContributors.length === 0}
			<p>
				A confirmation email has been sent to <em>{form.user.email}</em> with your link for the
				voting phase. <strong>Please do not delete this email.</strong>
			</p>
			<p>The vote is not open yet but you can bookmark your link now:</p>
			<p>
				<a href="/vote/{form.user.token}">your personal link</a>
			</p>
		{:else}
			<p>
				Every member of the team will soon receive a confirmation email with their link for the
				voting phase. <strong>Please do not delete this email.</strong>
			</p>
		{/if}
		<p>See you in the voting phase!</p>
	{:else if form?.update}
		<h2>Thank you!</h2>
		<p>Your entry was successfully updated</p>
	{:else}
		<h2>Join the competition</h2>
		<h3>Creators</h3>
		<p>
			The registration deadline is <strong><Time datetime={PUBLIC_REGISTRATION_END} /></strong>.
		</p>
		<p>
			As a creator you are automatically registered as a judge as well, no extra step is required.
		</p>
		<h3>Judges</h3>
		<p>
			If you don't want to submit an entry you can still help out in the voting phase as a judge.
		</p>
		<h3>Important Notes:</h3>
		<ul>
			<li>
				You can only submit one entry per person/group for the competition; however, you may submit
				multiple entries if you are a part of different groups.
			</li>
			<li>
				You should not register both as a creator and as a judge. If you are a creator, you will
				automatically be signed up as a judge as well.
			</li>
			<li>
				Please read the <a href="/#rules"><u>rules and judging criteria</u></a> before submitting your
				entry.
			</li>
		</ul>

		<form
			method="post"
			enctype="multipart/form-data"
			use:enhance={({ submitter, data }) => {
				data.append('others', JSON.stringify(otherContributors));
				submitter?.setAttribute('disabled', 'on');

				return async ({ update }) => {
					await update();
					submitter?.removeAttribute('disabled');
				};
			}}
		>
			<div class="form-control max-w-md">
				<span class="label-text"> I am a </span>
				{#each userTypes as type, i}
					{@const disabled = type === 'creator' && !registrationOpen()}
					<label
						for="user-type-{i}"
						class={`label ${
							disabled ? 'cursor-not-allowed' : 'cursor-pointer'
						} justify-start gap-2`}
						title={disabled ? 'Deadline passed' : userType}
					>
						<input
							id="user-type-{i}"
							class="radio"
							type="radio"
							bind:group={userType}
							name="userType"
							value={type}
							required
							{disabled}
						/>
						<span class="label-text capitalize"> {type} </span>
					</label>
				{/each}

				{#if form?.fieldErrors?.userType}
					<span class="text-error">{form.fieldErrors.userType.join(', ')}</span>
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
					placeholder="john@gmail.com"
					class="input-bordered input w-full"
					bind:value={email}
					required
				/>
				{#if form?.fieldErrors?.email}
					<span class="block text-error">{form.fieldErrors.email.join(', ')}</span>
				{/if}
			</div>
			{#if userType === 'creator'}
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
								on:click={() => {
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
						on:click={addContributor}
					>
						+</button
					>
				</p>
			{/if}
			{#if form?.emailExists}
				<span class="block text-error">email already registered: {form.emailExists}</span>
			{:else if form?.undeliverable}
				<span class="block text-error"
					>undeliverable email{otherContributors.length > 0 ? ': ' + form.undeliverable : ''}</span
				>
			{/if}

			{#if userType === 'creator'}
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
						<span class="block text-error">{form.fieldErrors.category.join(', ')}</span>
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
						<span class="block text-error">{form.fieldErrors.title.join(', ')}</span>
					{/if}
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
						rows="5"
						bind:value={description}
						required
					/>
					<div class="label">
						<span class="label-text-alt text-error">
							{#if form?.fieldErrors?.description}
								{form.fieldErrors.description.join(', ')}
							{/if}
						</span>
						<span class="label-text-alt">{description.length}/500</span>
					</div>
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
					/>
					{#if form?.fieldErrors?.link}
						<span class="block text-error">{form.fieldErrors.link.join(', ')} </span>
					{:else if form?.linkExists}
						<span class="block text-error">entry already registered</span>
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
							<span class="block text-error">{form.fieldErrors.thumbnail.join(', ')} </span>
						{:else if form?.thumbnailRequired}
							<span class="block text-error">A thumbnail is required</span>
						{/if}
					</div>
				{/if}
			{/if}

			<div class="form-control max-w-md">
				<label for="rules" class="label justify-normal gap-4">
					<input id="rules" type="checkbox" name="rules" class="checkbox" required />
					<span class="label-text">
						I've read the <a href="/#rules">rules</a> of the competition
					</span>
				</label>
				{#if form?.fieldErrors?.rules}
					<span class="block text-error">{form.fieldErrors.rules.join(', ')} </span>
				{/if}
			</div>

			{#if userType === 'creator'}
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
						<span class="block text-error">{form.fieldErrors.copyright.join(', ')} </span>
					{/if}
				</div>
			{/if}

			{#if form?.fieldErrors || $page.status !== 200}
				<p class="block text-error">
					Something went wrong. {form?.invalid
						? 'Please correct the highlighted fields above'
						: form?.network
						? 'There was a network error. Please try again later'
						: ''}
				</p>
			{/if}
			<p>
				{#if userType === 'judge'}
					<button class="btn-primary btn block"> Register </button>
				{:else if userType === 'creator'}
					<button class="btn-primary btn block"> Submit </button>
				{/if}
			</p>
			<p class="text-sm">
				<a href="/gdpr">Privacy policy</a>
			</p>
		</form>
	{/if}
</article>

<style>
	label {
		margin-top: theme('margin.2');
	}
</style>
