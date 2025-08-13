import type { SubmitFunction } from "@sveltejs/kit";
import { reportValidityBase } from "formgator/sveltekit";
import { newToast, type ToastConfig } from "./components/Toasts.svelte";

type SubmitFunctionReturnType = Awaited<ReturnType<SubmitFunction>>;
type SubmitResponseCallback = Exclude<SubmitFunctionReturnType, void>;

export const disableSubmitterAndSetValidity: (options?: {
	toast?: {
		success?: string;
		error?: string;
		failure?: string;
		redirect?: ToastConfig;
	};
	reset?: boolean;
	invalidateAll?: boolean;
	before?: (...a: Parameters<SubmitFunction>) => void;
	after?: (...a: Parameters<SubmitResponseCallback>) => void;
}) => SubmitFunction = (options) => (input) => {
	const buttons = input.formElement.querySelectorAll("button");
	buttons.forEach((b) => b.setAttribute("disabled", "on"));
	options?.before?.(input);

	return async (opts) => {
		await opts.update({
			reset: options?.reset ?? false,
			invalidateAll: options?.invalidateAll ?? false,
		});

		reportValidityBase(opts);
		buttons.forEach((b) => b.removeAttribute("disabled"));

		const result = opts.result;
		const toast = options?.toast;
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

		if (options?.after) {
			await Promise.try(options.after, opts);
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
