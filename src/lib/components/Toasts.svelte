<script lang="ts" module>
	import { writable } from "svelte/store";

	interface ToastConfig {
		/**
		 * The innerHTML or innerText string
		 */
		content: string;
		duration?: number;
		type?: "info" | "success" | "error";
	}

	interface Toast extends ToastConfig {
		id: number;
	}

	const toasts = writable<Toast[]>([]);

	let id = 0;
	/**
	 * Emits a toast with the following config
	 *
	 * @param config ToastConfig object
	 * @param config.content message to display
	 * @param config.duration defaults to 3000ms
	 * @param config.variant defaults to 'info'
	 */
	export function newToast(config: ToastConfig) {
		id = (id + 1) % Number.MAX_SAFE_INTEGER;
		toasts.update((state) => {
			return [
				...state,
				{ ...config, id, duration: config.duration ?? 3000, type: config.type ?? "info" },
			];
		});
	}
</script>

<script lang="ts">
	import { flip } from "svelte/animate";
	import { quintOut } from "svelte/easing";
	import { crossfade } from "svelte/transition";

	const [send, receive] = crossfade({
		fallback(node, params) {
			const style = getComputedStyle(node);
			const transform = style.transform === "none" ? "" : style.transform;
			const duration = params.duration ? +params.duration : 100;

			return {
				duration,
				easing: quintOut,
				css: (t) => `transform: ${transform} scale(min(${0.7 + t},1)); opacity: ${t}`,
			};
		},
	});

	function willRemove(toast: Toast) {
		setTimeout(() => {
			toasts.update((state) => state.filter((t) => t.id !== toast.id));
		}, toast.duration);
	}
</script>

<section class="toasts-container">
	{#each $toasts as toast (toast.id)}
		<!-- output is announced to screen readers with implicit role status -->
		<output
			class="toast text-sm text-white rounded-md py-3 px-4 shadow-sm"
			class:bg-green-600={toast.type === "success"}
			class:bg-gray-900={toast.type === "info"}
			class:bg-red-600={toast.type === "error"}
			in:receive={{ key: toast.id, duration: 300, easing: quintOut }}
			out:send={{ key: toast.id, duration: 200 }}
			animate:flip={{ duration: 200, easing: quintOut }}
			onintroend={() => willRemove(toast)}
		>
			{@html toast.content}
		</output>
	{/each}
</section>

<style>
	.toasts-container {
		position: fixed;
		/* non-zero z-index to create a stacking context and isolate from main */
		z-index: 1;
		bottom: 1rem;
		right: 1rem;
		transform: translateX(-50%);

		display: grid;
		justify-content: center;
		justify-items: center;
		gap: calc(var(--spacing) * 2);
	}

	.toast {
		max-width: min(60ch, 90vw);
	}
</style>
