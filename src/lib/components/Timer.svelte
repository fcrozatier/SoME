<script lang="ts">
	import { PUBLIC_REGISTRATION_END } from '$env/static/public';
	import { onMount } from 'svelte';

	export let show = false;

	let ms = Date.parse(PUBLIC_REGISTRATION_END) - Date.now();
	$: d = Math.floor(ms / (1000 * 60 * 60 * 24));
	$: h = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	$: min = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
	$: sec = Math.floor((ms % (1000 * 60)) / 1000);

	$: days = `${d > 0 ? d.toString() + ` day${d > 1 ? 's' : ''} ` : ''}`;
	$: remaining = `${days}${h}h ${min}min ${sec}s`;

	let interval: NodeJS.Timeout | undefined;
	onMount(() => {
		interval = setInterval(() => {
			ms = Date.parse(PUBLIC_REGISTRATION_END) - Date.now();
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

{#if show && ms > 0}
	<a href="/register" class="alert alert-error mx-auto max-w-prose sticky top-0 z-10">
		<strong class="countdown font-mono text-xl">
			{remaining}
		</strong>
		remaining to register as a creator <span class="text-xl">&rarr;</span>
	</a>
{/if}
