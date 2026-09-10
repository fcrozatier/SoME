<script lang="ts">
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

	let array = $derived(makeArray(+pageNumber));
</script>

<div class="mt-10 mx-auto flex justify-center">
	{#if pages > 1}
		<nav class="join" aria-label="Pagination" focusgroup="toolbar">
			{#each array as n}
				{#if Number.isNaN(n)}
					<span
						class="join-item btn btn-square max-sm:btn-sm pointer-events-none"
						aria-hidden="true"
					>
						...
					</span>
				{:else}
					{@const params = new Map(page.url.searchParams).set("page", String(n))}
					<a
						href={"?" + new URLSearchParams([...params]).toString()}
						class={["join-item btn btn-square max-sm:btn-sm", n === +pageNumber && "btn-neutral"]}
						aria-current={n === +pageNumber ? "page" : undefined}
						aria-label={`Page ${n}`}
						data-sveltekit-keepfocus
						data-sveltekit-noscroll>{n}</a
					>
				{/if}
			{/each}
		</nav>
	{/if}
</div>
