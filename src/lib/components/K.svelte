<script module lang="ts">
	import type { KatexOptions } from "katex";
	import katex from "katex";
</script>

<script lang="ts">
	interface Props {
		displayMode?: boolean;
		nowrap?: boolean;
		tex: string;
		options?: KatexOptions;
	}

	let { displayMode = false, nowrap = false, tex, options = { output: "html" } }: Props = $props();
</script>

<!-- SSR with renderToString -->
<span class:whitespace-nowrap={nowrap}>
	{@html katex.renderToString(tex, { displayMode, throwOnError: false, ...options })}
</span>
