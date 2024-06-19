<script lang="ts">
	import { page } from '$app/stores';
	import Banner from '$lib/components/Banner.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { BETA_TEST, COMPETITION_FULL_NAME } from '$lib/config';
	import { registrationOpen, voteOpen } from '$lib/utils';
	import '../app.css';
	import Timer from '../lib/components/Timer.svelte';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
</script>

<div class="flex min-h-[100vh] flex-col">
	<nav class="navbar gap-8 p-4">
		<a class="inline-flex items-center gap-4" href="/">
			<Icon class="rounded-full" name="logo" width="3.5em" />
			<span>Home</span></a
		>
		{#if voteOpen() && data.token}
			<a href="/vote">Vote</a>
		{/if}
		{#if $page.data.isAdmin}
			<a href="/admin">Admin</a>
		{/if}

		<span class="navbar-end ml-auto mr-4 flex gap-2">
			<a title="Substack" href="https://3blue1brown.substack.com" target="_blank">
				<Icon class="fill-gray-800 px-2 hover:fill-[#f35300]" name="substack" width="2.5rem" />
			</a>
			<a title="Discord" href="https://discord.gg/WZvZMVsXXR" target="_blank">
				<Icon class="fill-gray-800 px-2 hover:fill-[#5865f2]" name="discord" width="2.5rem" />
			</a>
		</span>
	</nav>

	<Banner test={BETA_TEST} />
	{#if registrationOpen()}
		<Timer></Timer>
	{/if}

	<main class="prose mb-40 mt-8 max-w-full">
		<h1 class="text-center">{COMPETITION_FULL_NAME}</h1>
		<slot />
	</main>

	<footer class="mt-auto flex flex-wrap justify-center gap-x-20 gap-y-10 p-4">
		<a
			href="https://github.com/fcrozatier/SoME"
			class="inline-flex items-center gap-3 opacity-80 hover:opacity-100"
			target="_blank"
			><Icon name="github" width="1.5rem" />
		</a>
		<a href="/gdpr"> GDPR </a>
		<a href="/content-policy"> Content Policy </a>
		<a href="/contact"> Contact </a>
		<a href="/previous"> Previous Edition </a>
	</footer>
</div>
