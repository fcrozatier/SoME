<script lang="ts">
	import LayoutProse from "$lib/components/LayoutProse.svelte";
	import type { Snippet } from "svelte";

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<LayoutProse>{@render children()}</LayoutProse>
