<script lang="ts">
	import { COMPETITION_SHORT_NAME } from '$lib/config';
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	<title>Vote &middot; {COMPETITION_SHORT_NAME}</title>
</svelte:head>

{@render children?.()}
