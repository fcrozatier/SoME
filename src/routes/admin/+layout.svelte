<script lang="ts">
	import { formatTitle } from "$lib/utils/formatting";
	import type { Snippet } from "svelte";

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	<title>{formatTitle("Admin Panel")}</title>
</svelte:head>

{@render children?.()}
