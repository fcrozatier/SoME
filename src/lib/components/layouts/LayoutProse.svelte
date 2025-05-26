<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<article class="prose max-w-[var(--w-prose)] mx-auto px-8">
	{@render children?.()}
</article>
