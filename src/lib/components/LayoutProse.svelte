<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<!-- Component for the Content Policy -->
<article class="prose max-w-4xl mx-auto px-8">
	{@render children?.()}
</article>
