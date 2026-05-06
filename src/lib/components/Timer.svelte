<script lang="ts">
	import { timeLeft } from "$lib/utils/time";
	import { onMount } from "svelte";

	let interval: NodeJS.Timeout | undefined;
	let remaining = $state(timeLeft());

	onMount(() => {
		interval = setInterval(() => {
			remaining = timeLeft();
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<a
	href="/user/entries/new"
	class="alert alert-error mx-auto max-w-prose sticky top-0 z-10 mb-8 text-xs sm:text-base"
>
	{#if remaining.ms > 0}
		<strong class="countdown font-mono text-sm sm:text-lg">
			{remaining.formatted}
		</strong>
		remaining to submit an entry <span class="text-xl">&rarr;</span>
	{:else}
		<p class="font-semibold">Registration is closed for creators</p>
	{/if}
</a>

<style>
	a {
		text-decoration: none;
	}
</style>
