<script lang="ts">
	import type { Snippet } from "svelte";
	import { titleSnippet } from "../../+layout.svelte";

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	{@render titleSnippet("Vote")}
</svelte:head>

{@render children?.()}
