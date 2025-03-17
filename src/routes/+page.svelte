<script lang="ts">
	import { enhance } from "$app/forms";
	import { newToast } from "$lib/components/Toasts.svelte";
	import { COMPETITION_FULL_NAME, COMPETITION_SHORT_NAME } from "$lib/config";
	import ResultsPage from "./results/+page.svelte";

	let { data, form } = $props();

	// let personalLinkDialog: HTMLDialogElement;
	// let email: string;

	// function closeDialog() {
	// 	personalLinkDialog.close();
	// 	if (form) {
	// 		form.emailInvalid = undefined;
	// 		form.error = undefined;
	// 		form.success = undefined;
	// 	}
	// }
</script>

<svelte:head>
	<title>{COMPETITION_SHORT_NAME}</title>
</svelte:head>

<section class="layout-prose pb-4">
	<!-- <p class=" mb-16 text-center text-3xl font-light">Create and discover new math content.</p> -->

	<p class=" mb-16 text-center text-3xl font-light">SoME4, summer 2025, coming soon...</p>
	<p>
		The {COMPETITION_FULL_NAME} ({COMPETITION_SHORT_NAME}) is an annual competition to foster the
		creation of excellent math content online. You can participate as either a creator or judge.
		<a href="/rules" rel="terms-of-service">Learn more</a>
	</p>
	<form
		class="grid justify-center"
		method="post"
		action="?/newsletter"
		use:enhance={({ submitter }) => {
			submitter?.setAttribute("disabled", "on");

			return async ({ result, update }) => {
				submitter?.removeAttribute("disabled");
				await update();

				if (result.type === "success") {
					newToast({
						type: "success",
						content: "You'll be notified of future editions! 🎉",
					});
				}
			};
		}}
	>
		<h3 id="stay-tuned">Receive News on Upcoming Editions</h3>
		<div class="flex gap-2">
			<input
				type="email"
				name="email"
				class="input input-bordered"
				placeholder="Email"
				aria-label="Email"
				aria-describedby="stay-tuned"
				maxlength="128"
				required
			/>
			<button type="submit" class="btn">Stay updated</button>
		</div>
		{#if form && !form.success}
			<div class="text-sm pt-1 font-medium text-error">
				{form.issues?.email?.message}
			</div>
		{/if}
	</form>
</section>

<ResultsPage {data}></ResultsPage>

<!-- Last year -->
<!-- <section class="text-ligh bg-black/95 pb-32 pt-24 text-center" style:color="var(--light-gold)">
	<div class="mx-auto max-w-prose">
		<h2 class="my-0 text-5xl font-black" style:color="var(--light-gold)">
			Last year's competition
		</h2>
		<p class="mt-8 font-light tracking-wider">
			Discover the 5 winners of the last edition. <br />

			The 20 honorable mentions as well as the full list of entries is available
			<a class="font-light" style:color="var(--light-gold)" href="/previous">here</a>
		</p>
	</div>
	<div class="mx-4">
		<div
			class="scrollbar mx-auto flex max-w-5xl snap-x snap-proximity snap-always items-center gap-10 overflow-x-scroll pb-2"
			style:--scrollbar-thumb="var(--light-gold)"
		>
			{#each winners as winner}
				<div class="snap-center">
					{#if winner.video}
						<Youtube src={winner.link}></Youtube>
					{:else}
						<a href={winner.link} target="_blank" class="inline-block w-[420px]">
							<img
								src={winner.thumbnail}
								alt="Winner thumbnail"
								width="420"
								class="aspect-video rounded-lg"
								loading="lazy"
							/>
						</a>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section> -->

<!-- <dialog class="mb-auto" bind:this={personalLinkDialog}>
	<form
		class=""
		method="post"
		action="?/resend_link"
		use:clickOutside={closeDialog}
		use:enhance={({ submitter }) => {
			submitter?.setAttribute("disabled", "on");
			return async ({ update, result }) => {
				submitter?.removeAttribute("disabled");
				if (result.type === "success") {
					newToast({ type: "success", content: "Email sent!" });
					personalLinkDialog.close();
				}
				await update();
			};
		}}
	>
		<h2 class="mt-0">Personal link</h2>
		<p>You will receive an email with your personal link.</p>
		<label for="email" class="label flex align-baseline content-between"
			>Email <small class="font-light text-gray-700">(the one you registered with)</small></label
		>
		<input
			id="email"
			type="email"
			name="email"
			placeholder="john@gmail.com"
			class="input-bordered input w-full"
			bind:value={email}
			required
		/>

		<p class="flex gap-4 mt-8">
			<button type="button" class="btn-outline btn" on:click={closeDialog}>Close</button>
			<button type="submit" class="btn-primary btn">Send email</button>
		</p>
		{#if form?.error}
			<span class="text-error">{form.message}</span>
		{/if}
	</form>
</dialog> -->
