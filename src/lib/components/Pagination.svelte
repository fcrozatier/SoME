<script lang="ts">
	import { browser } from "$app/environment";

	interface Props {
		pages: number;
		pageNumber?: string;
		onchange?: any;
	}

	let { pages, pageNumber = $bindable("1"), onchange = () => {} }: Props = $props();

	const makeArray = (current: number) => {
		const array: number[] = [];

		if (width < 500) {
			for (const num of [
				1,
				Math.max(1, current - 1),
				current,
				Math.min(current + 1, pages),
				pages,
			]) {
				const last = array.at(-1);
				if (last && !Number.isNaN(last) && last < num - 1) {
					array.push(NaN);
				}
				if (!array.includes(num)) {
					array.push(num);
				}
			}
			return array;
		}
		return Array.from({ length: pages }, (_, i) => i + 1);
	};

	let width = $state(browser ? window.innerWidth : Infinity);
	let array = $derived(makeArray(+pageNumber));
</script>

<svelte:window bind:innerWidth={width} />

<div class="mt-10 mx-auto flex justify-center">
	{#if pages > 1}
		<form class="join" {onchange}>
			{#each array as n}
				{#if Number.isNaN(n)}
					<span class="px-2"> ... </span>
				{:else}
					<input
						id={`radio${n}`}
						class="join-item btn btn-square"
						class:btn-neutral={n === +pageNumber}
						type="radio"
						name="pagination"
						aria-label={`${n}`}
						value={n}
						bind:group={pageNumber}
					/>
				{/if}
			{/each}
		</form>
	{/if}
</div>
