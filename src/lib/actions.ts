import type { SubmitFunction } from "@sveltejs/kit";
import * as fg from "formgator";

export const disableSubmitter: SubmitFunction = ({ submitter }) => {
	submitter?.setAttribute("disabled", "on");

	return async ({ update }) => {
		await update();
		submitter?.removeAttribute("disabled");
	};
};

export const reportValidity: SubmitFunction = ({ submitter }) => {
	submitter?.setAttribute("disabled", "on");

	return async ({ update, result, formElement }) => {
		await update();
		submitter?.removeAttribute("disabled");

		if (result.type === "failure" && typeof result.data?.issues === "object") {
			const issues = result.data.issues as Record<string, fg.ValidationIssue>;

			for (const element of formElement.elements) {
				if (!(element instanceof HTMLInputElement)) continue;

				const customMessage = issues[element.name]?.message;
				if (customMessage) element.setCustomValidity(customMessage);
				element.reportValidity();

				element.addEventListener("input", () => element.setCustomValidity(""), {
					once: true,
				});
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
