<script lang="ts">
	import { page } from '$app/stores';
	import { clickOutside } from '$lib/actions';
	import Banner from '$lib/components/Banner.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Toasts from '$lib/components/Toasts.svelte';
	import { BETA_TEST, COMPETITION_FULL_NAME } from '$lib/config';
	import Menu from '$lib/icons/menu.svg';
	import { registrationOpen, voteOpen } from '$lib/utils';
	import '../app.css';
	import Timer from '../lib/components/Timer.svelte';
	import '../math.css';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	let sideNav: HTMLDialogElement;
</script>

<Toasts />

<!-- Isolation: isolate from toasts to avoid stacking issues  -->
<div class="flex isolate min-h-[100vh] flex-col">
	<nav class="navbar gap-8 p-4">
		<a class="inline-flex items-center gap-4" href="/">
			<Icon class="rounded-full" name="logo" width="3.5em" />
			<span>Home</span></a
		>
		<button class="ml-auto mr-4 sm:hidden" on:click={() => sideNav.showModal()}
			><img src={Menu} alt="Menu" /></button
		>
		<span class="navbar-start gap-8 hidden sm:flex">
			<a href="/algorithm"> Algorithm </a>
			{#if voteOpen() && data.token}
				<a href="/vote">Vote</a>
			{/if}
			{#if $page.data.isAdmin}
				<a href="/admin">Admin</a>
			{/if}
		</span>

		<span class="navbar-end ml-auto mr-4 gap-3 hidden sm:flex">
			<a
				title="GitHub"
				href="https://github.com/fcrozatier/SoME"
				class="fill-gray-800 hover:opacity-100"
				target="_blank"
				><Icon name="github" width="1.8rem" />
			</a>
			<a title="Substack" href="https://3blue1brown.substack.com" target="_blank">
				<Icon class="fill-gray-800 px-2 hover:fill-[#f35300]" name="substack" width="2.5rem" />
			</a>
			<a title="Discord" href="https://discord.gg/WZvZMVsXXR" target="_blank">
				<Icon class="fill-gray-800 px-2 hover:fill-[#5865f2]" name="discord" width="2.5rem" />
			</a>
		</span>
	</nav>
	<dialog class="m-0 left-full -translate-x-full" bind:this={sideNav}>
		<aside class="" use:clickOutside={() => sideNav.close()}>
			<h2 class="font-semibold">Menu</h2>
			<ul class="flex-col flex gap-4 mt-4">
				<li>
					<a href="/algorithm"> Algorithm </a>
				</li>
				<li>
					{#if voteOpen() && data.token}
						<a href="/vote">Vote</a>
					{/if}
				</li>
				<li>
					{#if $page.data.isAdmin}
						<a href="/admin">Admin</a>
					{/if}
				</li>
				<li class="flex items-center justify-between gap-4">
					<a
						title="GitHub"
						href="https://github.com/fcrozatier/SoME"
						class="fill-gray-800 hover:opacity-100"
						target="_blank"
						><Icon name="github" width="1.8rem" />
					</a>
					<a title="Substack" href="https://3blue1brown.substack.com" target="_blank">
						<Icon class="fill-gray-800 px-2 hover:fill-[#f35300]" name="substack" width="2.5rem" />
					</a>
					<a title="Discord" href="https://discord.gg/WZvZMVsXXR" target="_blank">
						<Icon class="fill-gray-800 px-2 hover:fill-[#5865f2]" name="discord" width="2.5rem" />
					</a>
				</li>
			</ul>
		</aside>
	</dialog>

	<Banner test={BETA_TEST} />
	{#if registrationOpen()}
		<Timer></Timer>
	{/if}

	<main class="prose mb-40 mt-8 max-w-full">
		<h1 class="text-center">{COMPETITION_FULL_NAME}</h1>
		<slot />
	</main>

	<footer class="mt-auto flex flex-wrap justify-center wh gap-x-20 gap-y-10 p-4">
		<a href="/gdpr"> GDPR </a>
		<a href="/content-policy"> Content Policy </a>
		<a href="/contact"> Contact </a>
		<a href="/previous"> Previous Edition </a>
	</footer>
</div>
