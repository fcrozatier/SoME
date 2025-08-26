<script lang="ts">
	import { round } from "@fcrozatier/ts-helpers";

	const { score }: { score: number } = $props();

	const color = $derived(
		score < 5
			? `color-mix(in oklch, var(--color-error), var(--color-warning) ${round((2 * 100 * (score - 1)) / 8)}%)`
			: `color-mix(in oklch, var(--color-warning), var(--color-success) ${round(2 * ((100 * (score - 1)) / 8 - 50))}%)`,
	);
</script>

<div class="w-16 flex justify-center" style={`--color: ${color};`}>
	<span
		class={`w-8 border text-xs rounded-full aspect-square min-w-4 text-center px-2 flex items-center justify-center`}
	>
		{round(score, 1)}
	</span>
</div>

<style>
	span {
		background-color: oklch(from var(--color) l c h / 10%);
		border: 1px solid var(--color);
	}
</style>
