<script lang="ts">
	import type { Snippet } from "svelte";

	type Props = {
		count: number | null | undefined;
		color?: "danger" | "warning" | "success" | "default";
		children: Snippet;
	};

	let { count, color = "default", children }: Props = $props();
</script>

<div class={`rounded-4xl border-2 aspect-square w-36 sm:w-40 grid place-items-center ${color}`}>
	<div class="flex flex-col items-center gap-2">
		<span class="text-5xl">
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
	.danger {
		background-color: color-mix(in oklab, var(--color-error) 10%, transparent);
		border-color: var(--color-error);

		& span:first-of-type {
			color: var(--color-error);
		}
	}
	.warning {
		background-color: color-mix(in oklab, var(--color-warning) 10%, transparent);
		border-color: var(--color-warning);

		& span:first-of-type {
			color: var(--color-warning);
		}
	}
	.success {
		background-color: color-mix(in oklab, var(--color-success) 10%, transparent);
		border-color: var(--color-success);

		& span:first-of-type {
			color: var(--color-success);
		}
	}
</style>
