<script lang="ts">
	let { content }: { content: string } = $props();

	let open = $state(false);

	let summary: HTMLElement | undefined = $state();

	$effect(() => {
		if (summary) {
			// Remove the summary from the tab sequence if JS is available, so that focus goes directly to the More/Less button when tabbing
			summary.tabIndex = -1;
		}
	});
</script>

<div class="pile relative mb-10">
	<details bind:open>
		<summary bind:this={summary}>{content}</summary>
		<section>{content}</section>
	</details>

	<div class="relative mt-4 -bottom-12 self-end flex justify-between items-center">
		<hr class="bg-gray-50 w-full" />
		<button
			class="btn btn-outline btn-sm px-10 -bottom-3 left-0 border-gray-300 border"
			onclick={() => (open = !open)}>{open ? "Less..." : "More..."}</button
		>
		<hr class="bg-gray-50 font-semibold w-full" />
	</div>
</div>

<style>
	details {
		border: none;
		padding-block: 0;
		margin-bottom: calc(var(--spacing) * 6);

		& > summary::before,
		& > summary::after {
			display: none;
		}
	}

	summary {
		position: absolute;

		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
		text-overflow: ellipsis;
		height: 3lh;

		padding: 0;
		font-size: var(--text-base);
		font-weight: var(--font-weight-normal);
		text-box-trim: none;

		cursor: auto;

		transition: opacity 250ms;
	}

	details:has(summary:focus-visible) + div button {
		outline: 2px solid var(--color-gray-900);
	}

	details:open summary {
		opacity: 0;
	}
</style>
