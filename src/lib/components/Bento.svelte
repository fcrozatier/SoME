<script lang="ts">
	import { round } from "@fcrozatier/ts-helpers";
	import type { Snippet } from "svelte";

	type Props = {
		count: number | null | undefined;
		color?: boolean;
		children: Snippet;
	};

	let { count, color = false, children }: Props = $props();

	const colorValue = $derived(
		count && color
			? count < 5
				? `color-mix(in oklch, var(--color-error), var(--color-warning) ${round((2 * 100 * (count - 1)) / 8)}%)`
				: `color-mix(in oklch, var(--color-warning), var(--color-success) ${round(2 * ((100 * (count - 1)) / 8 - 50))}%)`
			: "",
	);
</script>

<div
	class={`rounded-3xl border-2 aspect-square w-32 grid place-items-center ${colorValue ? "colored" : "default"}`}
	style={`--color: ${colorValue};`}
>
	<div class="flex flex-col items-center gap-2">
		<span class="text-3xl">
			{count ?? "-"}
		</span>
		<span>
			{@render children?.()}
		</span>
	</div>
</div>

<style>
	.default {
		border-color: var(--color-gray-200);
	}
	.colored {
		background-color: oklch(from var(--color) l c h / 10%);
		border: 2px solid var(--color);
	}
</style>
