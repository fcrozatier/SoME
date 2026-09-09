<script lang="ts">
	import { browser } from "$app/environment";
	import { page } from "$app/state";

	interface Props {
		pages: number;
		pageNumber?: number;
	}

	let { pages, pageNumber = $bindable(1) }: Props = $props();

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
		<nav class="join" aria-label="Pagination" focusgroup="toolbar">
			{#each array as n}
				{@const params = new Map(page.url.searchParams).set("page", String(n))}
				{#if Number.isNaN(n)}
					<button class="join-item btn btn-square pointer-events-none" aria-hidden="true">
						...
					</button>
				{:else}
					<a
						href={"?" + new URLSearchParams([...params]).toString()}
						class={["join-item btn btn-square", n === +pageNumber && "btn-neutral"]}
						aria-current={n === +pageNumber ? "page" : undefined}
						aria-label={`Page ${n}`}>{n}</a
					>
				{/if}
			{/each}
		</nav>
	{/if}
</div>
