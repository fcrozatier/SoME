<script lang="ts">
	import { setTitle } from "$lib/utils";
	import type { Snippet } from "svelte";

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

	setTitle("Admin");
</script>

{@render children?.()}
