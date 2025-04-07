<script lang="ts">
	import { SHORT_NAME } from "$lib/config";
	import type { Snippet } from "svelte";

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	<title>Admin &middot; {SHORT_NAME}</title>
</svelte:head>

{@render children?.()}
