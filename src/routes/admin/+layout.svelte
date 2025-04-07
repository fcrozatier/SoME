<script lang="ts">
	import { titleSnippet } from "$lib/components/snippets.svelte";
	import type { Snippet } from "svelte";

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	{@render titleSnippet("Admin")}
</svelte:head>

{@render children?.()}
