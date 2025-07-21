import type { ActionResult, SubmitFunction } from "@sveltejs/kit";
import { newToast, type ToastConfig } from "./components/Toasts.svelte";
import * as fg from "formgator";

export const reportValidity = <
	Success extends Record<string, unknown> | undefined = Record<string, any>,
	Failure extends Record<string, unknown> | undefined = Record<string, any>,
>(options: {
	result: ActionResult<Success, Failure>;
	formElement: HTMLFormElement;
}) => {
	const result = options.result;
	if (result.type === "failure" && typeof result.data?.issues === "object") {
		const issues = result.data.issues as Record<string, fg.ValidationIssue>;

		for (const element of options.formElement.elements) {
			if (
				!(element instanceof HTMLInputElement) &&
				!(element instanceof HTMLTextAreaElement) &&
				!(element instanceof HTMLSelectElement)
			)
				continue;

			const issue = issues[element.name]?.message ?? "";
			element.setCustomValidity(issue);
			element.reportValidity();

			element.addEventListener("input", () => element.setCustomValidity(""), {
				once: true,
			});
		}
	}
};

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

		return async ({ update, result, formElement }) => {
			await update({ reset: false, invalidateAll: false, ...options });
			reportValidity({ result, formElement });
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
