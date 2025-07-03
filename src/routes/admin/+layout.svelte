<script lang="ts">
	import { makeTitle } from "$lib/utils/makeTitle";
	import type { Snippet } from "svelte";

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	<title>{makeTitle("Admin Panel")}</title>
</svelte:head>

{@render children?.()}
