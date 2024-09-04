<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { clickOutside } from '$lib/actions';
	import Banner from '$lib/components/Banner.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Timer from '$lib/components/Timer.svelte';
	import Toasts from '$lib/components/Toasts.svelte';
	import { COMPETITION_FULL_NAME } from '$lib/config';
	import Menu from '$lib/icons/menu.svg';
	import { registrationOpen, resultsAvailable, voteOpen } from '$lib/utils';
	import '../app.css';
	import '../math.css';

	export let data;

	let sideNav: HTMLDialogElement;

	beforeNavigate(() => {
		sideNav.close();
	});
</script>

<Toasts />

<!-- Isolation: isolate from toasts to avoid stacking issues  -->
<div class="flex isolate min-h-[100vh] flex-col">
	<nav class="navbar gap-8 p-4">
		<a class="inline-flex items-center gap-4" href="/">
			<Icon class="rounded-full" name="logo" width="3.5em" />
		</a>
		<button class="ml-auto mr-4 sm:hidden" on:click={() => sideNav.showModal()}
			><img src={Menu} alt="Menu" /></button
		>
		<span class="navbar-start gap-8 hidden sm:flex">
			{#if voteOpen() && data.token}
				<a
					href="/vote"
					class="border-b-[1.5px] border-transparent font-medium hover:border-gray-900 aria-[current=page]:border-gray-900"
					aria-current={$page.url.pathname.includes('/vote') ? 'page' : null}>Vote</a
				>
			{/if}
			{#if resultsAvailable()}
				{#if data.isCreator}
					<a
						href="/feedback"
						class="border-b-[1.5px] border-transparent font-medium hover:border-gray-900 aria-[current=page]:border-gray-900"
						aria-current={$page.url.pathname.includes('/feedback') ? 'page' : null}>Feedback</a
					>
				{/if}
				<a
					href="/results"
					class="border-b-[1.5px] border-transparent font-medium hover:border-gray-900 aria-[current=page]:border-gray-900"
					aria-current={$page.url.pathname.includes('/results') ? 'page' : null}>Results</a
				>
			{/if}
			{#if $page.data.isAdmin}
				<a
					href="/admin"
					class="border-b-[1.5px] border-transparent font-medium hover:border-gray-900 aria-[current=page]:border-gray-900"
					aria-current={$page.url.pathname.includes('/admin') ? 'page' : null}>Admin</a
				>
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
				{#if voteOpen() && data.token}
					<li>
						<a href="/vote">Vote</a>
					</li>
				{/if}
				{#if resultsAvailable()}
					{#if data.isCreator}
						<li>
							<a href="/feedback">Feedback</a>
						</li>
					{/if}
					<li>
						<a href="/results">Results</a>
					</li>
				{/if}
				{#if $page.data.isAdmin}
					<li>
						<a href="/admin">Admin</a>
					</li>
				{/if}
				<li class="flex items-center justify-between gap-4 mt-4">
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

	<Banner display={true && !!data.token && !data.surveyTaken} />
	<Timer display={registrationOpen()}></Timer>

	<main class="prose mt-8 max-w-full">
		<h1 class="text-center">{COMPETITION_FULL_NAME}</h1>
		<slot />
	</main>

	<footer class="mt-auto p-4 mx-4">
		<!-- Sponsor -->
		<section class="mt-10 mb-40 pt-10">
			<h2 class="text-center mb-4 text-2xl font-light">
				Operations for this contest have been generously funded by
			</h2>
			<div class="flex justify-center">
				<a href="https://www.janestreet.com/" target="_blank">
					<Icon class="opacity-10" name="janeStreet" width="18rem" height="5rem" />
				</a>
			</div>
		</section>
		<!-- Links -->
		<section class="flex flex-wrap content-center justify-center gap-x-20 gap-y-10">
			<a href="/algorithm"> Algorithm </a>
			<a href="/contact"> Contact </a>
			<a href="/content-policy"> Content Policy </a>
			<a href="/gdpr"> GDPR </a>
			<a href="/rules">Rules</a>
		</section>
	</footer>
</div>
