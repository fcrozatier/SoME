import type { SubmitFunction } from "@sveltejs/kit";
import { reportValidity } from "formgator/sveltekit";
import { newToast, type ToastConfig } from "./components/Toasts.svelte";

export { reportValidity };

export const disableSubmitterAndSetValidity: (
	toast?: {
		success?: string;
		error?: string;
		failure?: string;
		redirect?: ToastConfig;
	},
	options?: { reset?: boolean; invalidateAll?: boolean },
) => SubmitFunction =
	(toast, options) =>
	({ submitter }) => {
		submitter?.setAttribute("disabled", "");

		return async ({ update, result }) => {
			await update({ reset: false, invalidateAll: false, ...options });
			reportValidity({ reset: false, invalidateAll: false, ...options });
			submitter?.removeAttribute("disabled");

			if (toast) {
				if (toast?.success && result.type === "success") {
					newToast({ type: "success", content: toast.success });
				} else if (toast?.error && result.type === "error") {
					newToast({ type: "error", content: toast.error });
				} else if (toast?.failure && result.type === "failure") {
					newToast({ type: "error", content: toast.failure });
				} else if (toast?.redirect && result.type === "redirect") {
					newToast(toast.redirect);
				}
			}
		};
	};

export function clickOutside(node: Element, callback: (node?: Element) => void) {
	const handleClick = (e: Event) => {
		if (node && !node.contains(e.target as Element)) {
			callback(node);
		}
	};

	document.addEventListener("click", handleClick, true);

	return {
		destroy() {
			document.removeEventListener("click", handleClick, true);
		},
	};
}

export function toggleSelectAll(node: HTMLElement) {
	const handleClick = () => {
		const allSelected = document.getElementById("all");
		const inputs = document.querySelectorAll<HTMLInputElement>(
			'input[type="checkbox"]:not([id="all"])',
		);

		if (allSelected && (allSelected as HTMLInputElement).checked) {
			for (const input of inputs) {
				if (!input.checked) {
					input.click();
				}
			}
		} else {
			for (const input of inputs) {
				if (input.checked) {
					input.click();
				}
			}
		}
	};

	node.addEventListener("click", handleClick, true);

	return {
		destroy() {
			node.removeEventListener("click", handleClick, true);
		},
	};
}
