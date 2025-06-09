<script lang="ts">
	import { browser } from "$app/environment";

	interface Props {
		pages: number;
		pageNumber?: number;
		onchange?: any;
	}

	let { pages, pageNumber = $bindable(1), onchange = () => {} }: Props = $props();

	const makeArray = (current: number) => {
		const array: number[] = [];

		for (const num of [1, Math.max(1, current - 1), current, Math.min(current + 1, pages), pages]) {
			const last = array.at(-1);
			if (last && !Number.isNaN(last) && last < num - 1) {
				array.push(NaN);
			}
			if (!array.includes(num)) {
				array.push(num);
			}
		}
		return array;
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
					<button class="join-item btn btn-square pointer-events-none"> ... </button>
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
