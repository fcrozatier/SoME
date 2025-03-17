<script lang="ts">
	import { beforeNavigate } from "$app/navigation";
	import { page } from "$app/state";
	import { clickOutside } from "$lib/actions";
	import Banner from "$lib/components/Banner.svelte";
	import Icon from "$lib/components/icons/Icon.svelte";
	import Icons from "$lib/components/icons/Icons.svelte";
	import Timer from "$lib/components/Timer.svelte";
	import Toasts from "$lib/components/Toasts.svelte";
	import { COMPETITION_FULL_NAME } from "$lib/config";
	import { registrationOpen, resultsAvailable, voteOpen } from "$lib/utils";
	import "../app.css";
	import "../math.css";

	let { data, children } = $props();

	let dialog: HTMLDialogElement | undefined = $state();

	beforeNavigate(() => dialog?.close());
</script>

<svelte:head>
	<script
		type="module"
		src="https://cdn.jsdelivr.net/npm/@justinribeiro/lite-youtube@1/lite-youtube.min.js"
	></script>
</svelte:head>

<Icons />
<Toasts />

{#snippet menu()}
	{#if voteOpen() && data.token}
		<li>
			<a
				href="/vote"
				class="menu-item"
				aria-current={page.url.pathname.includes("/vote") ? "page" : null}>Vote</a
			>
		</li>
	{/if}
	{#if resultsAvailable()}
		{#if data.isCreator}
			<li>
				<a
					href="/feedback"
					class="menu-item"
					aria-current={page.url.pathname.includes("/feedback") ? "page" : null}>Feedback</a
				>
			</li>
		{/if}
		<li>
			<a
				href="/results"
				class="menu-item"
				aria-current={page.url.pathname.includes("/results") ? "page" : null}>Results</a
			>
		</li>
		<li>
			<a
				href="/archive"
				class="menu-item"
				aria-current={page.url.pathname.includes("/archive") ? "page" : null}>Archive</a
			>
		</li>
	{/if}
	{#if page.data.isAdmin}
		<li>
			<a
				href="/admin"
				class="menu-item"
				aria-current={page.url.pathname.includes("/admin") ? "page" : null}>Admin</a
			>
		</li>
	{/if}
	<li class="menu-item-social mt-2 sm:mt-0 flex justify-between sm:justify-end items-center flex-1 gap-4">
		<a
			title="BlueSky"
			rel="author"
			href="https://bsky.app/profile/fcrozatier.bsky.social"
			class="fill-gray-800 p-2 hover:opacity-100 hover:fill-[#0085ff]"
			target="_blank"
			><Icon name="bluesky" class="size-6" />
		</a>

		<a
			title="GitHub"
			href="https://github.com/fcrozatier/SoME"
			class="fill-gray-800 p-2 hover:opacity-100"
			target="_blank"
			><Icon name="github" class="size-6" />
		</a>

		<a
			title="Substack"
			href="https://3blue1brown.substack.com"
			class="fill-gray-800 hover:fill-[#f35300] p-2"
			target="_blank"
		>
			<Icon name="substack" class="size-6" />
		</a>
		<a
			title="Discord"
			href="https://discord.gg/WZvZMVsXXR"
			class="fill-gray-800 hover:fill-[#5865f2] p-2"
			target="_blank"
		>
			<Icon name="discord" class="size-6" />
		</a>
	</li>
{/snippet}

<!-- Isolation: isolate from toasts to avoid stacking issues  -->
<div class="flex isolate min-h-[100vh] flex-col">
	<nav class="navbar gap-8 p-4">
		<a href="/" rel="home">
			<Icon class="rounded-full size-14" name="logo" />
		</a>
		<button
			class="ml-auto btn btn-ghost inline-flex items-center gap-2 px-3 text-base font-medium sm:hidden"
			onclick={() => dialog?.showModal()}
		>
			<Icon name="menu" class="size-6 stroke-[1.5px]" /> Menu
		</button>

		<ul class="nav-menu gap-8 items-center hidden sm:flex w-full">
			{@render menu()}
		</ul>
	</nav>
	<dialog class="mt-0! left-full -translate-x-full" bind:this={dialog}>
		<ul
			class="nav-menu gap-4 flex flex-col"
			use:clickOutside={() => dialog?.close()}
		>
			{@render menu()}
		</ul>
	</dialog>

	<Banner display={false && !!data.token && !data.surveyTaken} />
	<Timer display={registrationOpen()}></Timer>

	<main class="prose mt-8 max-w-full">
		<h1 class="text-center">{COMPETITION_FULL_NAME}</h1>
		{@render children?.()}
	</main>

	<footer class="mt-auto p-4 mx-4">
		<!-- Sponsor -->
		<section class="mt-10 mb-40 pt-10">
			<h2 class="text-center mb-4 text-2xl font-light">
				Operations for this contest have been generously funded by
			</h2>
			<div class="flex justify-center">
				<a href="https://www.janestreet.com/" rel="nofollow sponsored" target="_blank">
					<img class="opacity-20" src="/jane-street-logo.webp" alt="Jane Street" width="200">
				</a>
			</div>
		</section>
		<!-- Links -->
		<section class="flex flex-wrap content-center justify-center gap-x-20 gap-y-10">
			<a href="/algorithm" rel="about"> Algorithm </a>
			<a href="/contact"> Contact </a>
			<a href="/content-policy"> Content Policy </a>
			<a href="/gdpr" rel="privacy-policy"> GDPR </a>
			<a href="/rules" rel="terms-of-service">Rules</a>
		</section>
	</footer>
</div>

<style>
	.nav-menu {
		container-type: inline-size;
		min-width: 260px;
	}

	.menu-item {
		border-bottom: 2px solid transparent;
		border-left: none;

		font-weight: var(--font-weight-medium);
		padding: calc(var(--spacing) * 2);

		&:hover {
			@media (hover: hover) {
				border-color: var(--color-gray-900);
			}
		}

		&[aria-current="page"] {
			border-color: var(--color-gray-900);
		}
	}

	@media (width < 40rem) {
		.menu-item {
			border-left: 2px solid transparent;
			border-bottom: none;
			padding: var(--spacing) calc(var(--spacing) * 2) var(--spacing) calc(var(--spacing) * 4);
		}

		.menu-item-social {
			padding-left: calc(var(--spacing) * 2.5);
		}
	}
</style>
