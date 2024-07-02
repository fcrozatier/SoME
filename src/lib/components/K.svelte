<script context="module" lang="ts">
	import type { KatexOptions } from 'katex';
	import katex from 'katex';
</script>

<script lang="ts">
	export let displayMode = false;
	export let nowrap = false;
	export let tex: string;
	export let options: KatexOptions = { output: 'html' };
</script>

<!-- SSR with renderToString -->
<span class:whitespace-nowrap={nowrap}>
	{@html katex.renderToString(tex, { displayMode, throwOnError: false, ...options })}
</span>
