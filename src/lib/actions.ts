export function clickOutside(node: Element, callback: (node?: Element) => void) {
	const handleClick = (e: Event) => {
		if (node && !node.contains(e.target as Element)) {
			callback(node);
		}
	};

	document.addEventListener('click', handleClick, true);

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
}

export function toggleSelectAll(node: HTMLElement) {
	const handleClick = () => {
		const allSelected = document.getElementById('all');
		const inputs = document.querySelectorAll<HTMLInputElement>(
			'input[type="checkbox"]:not([id="all"])'
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

	node.addEventListener('click', handleClick, true);

	return {
		destroy() {
			node.removeEventListener('click', handleClick, true);
		}
	};
}
