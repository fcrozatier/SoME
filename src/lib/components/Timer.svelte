<script lang="ts">
	import { timeLeft } from '$lib/utils';
	import { onMount } from 'svelte';

	export let show = false;

	let remaining = timeLeft();

	let interval: NodeJS.Timeout | undefined;
	onMount(() => {
		interval = setInterval(() => {
			remaining = timeLeft();
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

{#if show}
	<a href="/register" class="alert alert-error mx-auto max-w-prose sticky top-0 z-10">
		{#if remaining.ms > 0}
			<strong class="countdown font-mono text-xl">
				{remaining.formatted}
			</strong>
			remaining to submit an entry <span class="text-xl">&rarr;</span>
		{:else}
			<p class="font-semibold">Registration closed for creators</p>
		{/if}
	</a>
{/if}
