<script lang="ts">
	import { beforeNavigate } from "$app/navigation";
	import { page } from "$app/state";
	import { PUBLIC_VOTE_START } from "$env/static/public";
	import { clickOutside } from "$lib/actions";
	import Banner from "$lib/components/Banner.svelte";
	import Icon from "$lib/components/icons/Icon.svelte";
	import Icons from "$lib/components/icons/Icons.svelte";
	import Time from "$lib/components/Time.svelte";
	import Timer from "$lib/components/Timer.svelte";
	import Toasts from "$lib/components/Toasts.svelte";
	import { FULL_NAME } from "$lib/config";
	import { submissionsOpen, voteOpen } from "$lib/utils/time";
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
	<ul class="grid gap-4">
		<li class={data.user ? "" : "translate-x-2"}>
			<a href="/archive" aria-current={page.url.pathname === "/archive" ? "page" : null}>Archive</a>
		</li>
		{#if data.user}
			{#if data.user?.isAdmin}
				<li>
					<a href="/admin" aria-current={page.url.pathname === "/admin" ? "page" : null}>Admin</a>
				</li>
			{/if}
			<li>
				<a href="/user/profile" aria-current={page.url.pathname === "/user/profile" ? "page" : null}
					>Profile</a
				>
			</li>
			<li>
				<a
					href="/user/entries"
					class="text-nowrap"
					aria-current={page.url.pathname === "/user/entries" ? "page" : null}>My Entries</a
				>
			</li>
			<li>
				<a
					href="/user/votes"
					class="text-nowrap"
					aria-current={page.url.pathname === "/user/votes" ? "page" : null}>My Votes</a
				>
			</li>
			<li class="mt-2 ml-1">
				<a
					href="/vote"
					class={`btn btn-neutral ${voteOpen() ? "" : "btn-disabled"}`}
					aria-current={page.url.pathname === "/vote" ? "page" : null}>Vote</a
				>
				<span class="text-xs block text-nowrap relative text-gray-700 -left-3 mt-1"
					>Starts <Time
						datetime={PUBLIC_VOTE_START}
						options={{ day: "2-digit", month: "2-digit", year: "2-digit" }}
					></Time>
				</span>
			</li>
		{:else}
			<li class="relative -translate-x-2">
				<a href="/signup" class="btn btn-neutral text-nowrap w-[10ch]">Sign up</a>
			</li>
			<li class="relative -translate-x-2">
				<a href="/login" class="btn text-nowrap w-[10ch]">Sign in</a>
			</li>
		{/if}
		<li
			class="mt-4 relative -translate-x-2 grid grid-cols-2 justify-between sm:justify-end items-center gap-2"
		>
			<a
				title="BlueSky"
				rel="author"
				href="https://bsky.app/profile/fred-crozatier.dev"
				class="fill-gray-800 p-2 hover:opacity-100 hover:fill-[#0085ff]"
				target="_blank"
				><Icon name="bluesky" class="size-6" />
			</a>
			<a
				title="Discord"
				href="https://discord.gg/WZvZMVsXXR"
				class="fill-gray-800 hover:fill-[#5865f2] p-2"
				target="_blank"
			>
				<Icon name="discord" class="size-6" />
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
				title="GitHub"
				href="https://github.com/fcrozatier/SoME"
				class="fill-gray-800 p-2 hover:opacity-100"
				target="_blank"
				><Icon name="github" class="size-6" />
			</a>
		</li>
	</ul>
{/snippet}

<div class="flex min-h-[100vh] flex-col">
	<dialog class="mt-0! left-full -translate-x-full" bind:this={dialog} closedby="any">
		<div use:clickOutside={() => dialog?.close()}>
			{@render menu()}
		</div>
	</dialog>

	<div class="grid lg:grid-cols-[9rem_1fr]">
		<nav class="flex col-span-full lg:block lg:col-span-1 lg:fixed lg:min-h-full p-8 space-y-8">
			<div class="flex pl-1">
				<a href="/" rel="home">
					<Icon class="rounded-full size-14" name="logo" />
				</a>
			</div>
			<button
				class="ml-auto btn btn-ghost inline-flex items-center gap-2 px-3 text-base font-medium lg:hidden"
				onclick={() => dialog?.showModal()}
			>
				<Icon name="menu" class="size-6 stroke-[1.5px]" /> Menu
			</button>

			<div class="hidden lg:block lg:pt-10">
				{@render menu()}
			</div>
		</nav>

		<main class="lg:col-start-2 prose lg:pt-10 max-w-full mb-40">
			<Banner display={false && !!data.user?.uid} />
			<Timer display={submissionsOpen()}></Timer>

			<h1 class="text-center">{FULL_NAME}</h1>
			{@render children()}
		</main>
	</div>

	<footer class="mt-auto mx-4">
		<!-- Links -->
		<section
			class="bg-black text-sm px-8 text-light-gold py-4 flex flex-wrap justify-center gap-x-20 -mx-4 gap-y-10"
		>
			<a class="text-trim" href="/algorithm" rel="about"> Algorithm </a>
			<a class="text-trim" href="/contact"> Contact </a>
			<a class="text-trim" href="/content-policy"> Content Policy </a>
			<a class="text-trim" href="/gdpr" rel="privacy-policy"> GDPR </a>
			<a class="text-trim" href="/rules" rel="terms-of-service">Rules</a>
		</section>
	</footer>
</div>

<style>
	li > a {
		&[aria-current="page"] {
			font-weight: 700;
		}
	}
</style>
