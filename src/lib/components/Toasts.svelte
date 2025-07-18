<script lang="ts" module>
	export interface ToastConfig {
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

	let toasts: Toast[] = $state([]);

	let id = 0;
	/**
	 * Emits a toast with the following config
	 *
	 * @param config ToastConfig object
	 * @param config.content message to display
	 * @param config.duration defaults to 3000ms
	 * @param config.variant defaults to 'info'
	 */
	export async function newToast(config: ToastConfig) {
		id = (id + 1) % Number.MAX_SAFE_INTEGER;
		const toastId = id;
		toasts.push({ ...config, id: toastId, type: config.type ?? "info" });

		requestAnimationFrame(() => {
			const toast = document.getElementById(`${toastId}`);
			if (!toast) throw new Error(`toast id ${toastId} not found`);

			toast.showPopover();

			setTimeout(() => {
				const toast = document.getElementById(`${toastId}`);
				if (!toast) throw new Error(`toast id ${toastId} not found`);
				toast.hidePopover();
			}, config.duration ?? 3000);
		});
	}
</script>

{#each toasts as toast (toast.id)}
	<aside
		id={`${toast.id}`}
		role="status"
		class="text-sm text-white rounded-md py-3 px-4 shadow-sm"
		data-type={toast.type}
		popover="manual"
	>
		{@html toast.content}
	</aside>
{/each}

<style>
	aside {
		inset: unset;
		bottom: 1rem;
		right: 1rem;
		opacity: 0;
		transform: scale(0.8);
		transition:
			opacity 250ms,
			transform 200ms,
			display 200ms allow-discrete,
			overlay 200ms allow-discrete;

		max-width: min(60ch, 90vw);

		&:popover-open {
			opacity: 1;
			transform: scale(1);

			@starting-style {
				opacity: 0;
				transform: scale(0.8);
			}
		}

		&[data-type="success"] {
			background-color: var(--color-green-600);
		}
		&[data-type="error"] {
			background-color: var(--color-red-600);
		}
		&[data-type="info"] {
			background-color: var(--color-gray-900);
		}
	}
</style>
