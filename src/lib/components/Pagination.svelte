<script lang="ts">
	import { browser } from '$app/environment';

	export let pages: number;
	export let pageNumber = '1';
	export let onChange = () => {};

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

	$: width = browser ? window.innerWidth : Infinity;
	$: array = makeArray(+pageNumber);
</script>

<svelte:window
	on:resize={() => {
		width = window.innerWidth;
		array = makeArray(+pageNumber);
		array = array;
	}}
/>

<div class="mt-10 mx-auto flex justify-center">
	{#if pages > 1}
		<form class="join" on:change={onChange}>
			{#each array as n}
				<div class="pagination-grid">
					{#if Number.isNaN(n)}
						<span class="px-2"> ... </span>
					{:else}
						<label
							for={`radio${n}`}
							class="join-item btn order-2"
							class:btn-primary={n === +pageNumber}
							>{n}
						</label>
						<input
							id={`radio${n}`}
							class="order-1"
							type="radio"
							name="pagination"
							value={n}
							bind:group={pageNumber}
						/>
					{/if}
				</div>
			{/each}
		</form>
	{/if}
</div>

<style>
	.pagination-grid {
		display: grid;
		place-items: center;
		align-items: center;

		& > * {
			grid-area: 1/1;
		}
	}
</style>
