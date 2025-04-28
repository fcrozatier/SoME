<script lang="ts">
	import { beforeNavigate } from "$app/navigation";
	import { page } from "$app/state";
	import { clickOutside } from "$lib/actions";
	import Banner from "$lib/components/Banner.svelte";
	import Icon from "$lib/components/icons/Icon.svelte";
	import Icons from "$lib/components/icons/Icons.svelte";
	import Timer from "$lib/components/Timer.svelte";
	import Toasts from "$lib/components/Toasts.svelte";
	import { FULL_NAME } from "$lib/config";
	import { registrationOpen, voteOpen } from "$lib/utils";
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
	<ul class="space-y-4 text-center">
		<li>
			<a
				href="/archive"
				aria-current={page.url.pathname.includes("/archive") ? "page" : null}>Archive</a
			>
		</li>
		{#if !data.user}
			<li>
				<a href="/signup" class="btn btn-neutral text-nowrap w-[10ch]">Sign up</a>
			</li>
			<li>
				<a href="/login" class="btn text-nowrap w-[10ch]">Sign in</a>
			</li>
		{/if}
		{#if voteOpen() && data.user}
			<li>
				<a
					href="/vote"
					aria-current={page.url.pathname.includes("/vote") ? "page" : null}>Vote</a
				>
			</li>
		{/if}
		{#if data.user?.isAdmin}
			<li>
				<a
					href="/admin"
					aria-current={page.url.pathname.includes("/admin") ? "page" : null}>Admin</a
				>
			</li>
		{/if}
		<li class="mt-8 grid grid-cols-2 justify-between sm:justify-end items-center flex-1 gap-2">
			<a
				title="BlueSky"
				rel="author"
				href="https://bsky.app/profile/fcrozatier.bsky.social"
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

<!-- Isolation: isolate from toasts to avoid stacking issues  -->
<div class="flex isolate min-h-[100vh] flex-col">
	<dialog class="mt-0! left-full -translate-x-full" bind:this={dialog} closedby="closerequest">
		<div use:clickOutside={() => dialog?.close()}>
			{@render menu()}
		</div>
	</dialog>

	<Banner display={false && !!data.user?.uid} />
	<Timer display={registrationOpen()}></Timer>

	<div class="grid lg:grid-cols-[10rem_1fr]">
		<nav class="flex col-span-full lg:block lg:col-span-1 lg:fixed lg:min-h-full p-8 space-y-8">
			<div class="flex justify-center">
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

		<main class="lg:col-start-2 prose lg:pt-10 max-w-full">
			<h1 class="text-center">{FULL_NAME}</h1>
			{@render children()}

			<!-- Sponsor -->
			<section class="mt-10 mb-40 pt-10">
				<h2 class="text-center mb-4 text-2xl font-light">
					Operations for this contest have been generously funded by
				</h2>
				<div class="flex justify-center">
					<a href="https://www.janestreet.com/" rel="nofollow sponsored" target="_blank">
						<img class="opacity-20" src="/jane-street-logo.webp" alt="Jane Street" width="200" />
					</a>
				</div>
			</section>
		</main>
	</div>

	<footer class="mt-auto mx-4">
		<!-- Links -->
		<section
			class="bg-black text-sm px-8 text-light-gold py-4 flex flex-wrap justify-center gap-x-20 -mx-4 gap-y-10"
		>
			<a href="/algorithm" rel="about"> Algorithm </a>
			<a href="/contact"> Contact </a>
			<a href="/content-policy"> Content Policy </a>
			<a href="/gdpr" rel="privacy-policy"> GDPR </a>
			<a href="/rules" rel="terms-of-service">Rules</a>
		</section>
	</footer>
</div>

<style>
	li > a {
		font-weight: 500;

		&[aria-current="page"] {
			font-weight: 700;
		}
	}
</style>
