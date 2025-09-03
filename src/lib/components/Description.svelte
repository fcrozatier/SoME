<script lang="ts">
	import { nanoId } from "@fcrozatier/ts-helpers";

	let { content }: { content: string } = $props();

	let open = $state(false);

	let description: HTMLElement | undefined = $state();
	let more: HTMLDivElement | undefined = $state();
	const clamped = $derived(description && description.clientHeight < description.scrollHeight);

	$effect(() => {
		// Ensures the styles are applied before checking, as with dynamically loaded descriptions inside dialogs
		requestAnimationFrame(() => {
			if (!clamped) {
				more?.remove();
			}
		});
	});

	const id = nanoId();
</script>

<div class="mb-12">
	<div>
		<p id="description-{id}" class="wrap-anywhere" data-open={open} bind:this={description}>
			{content}
		</p>

		<div class={"flex justify-between items-center "} bind:this={more}>
			<hr />
			<button
				class="btn btn-outline btn-sm px-10 border-gray-300"
				onclick={() => (open = !open)}
				aria-controls="description-{id}"
				aria-expanded={open}
			>
				{open ? "Less..." : "More..."}
			</button>
			<hr />
		</div>
	</div>
</div>

<style>
	hr {
		margin-block: 0;
		width: 100%;
		background-color: var(--color-gray-50);
	}

	p {
		--max-lines: 3;
		--transition-duration: 200ms;

		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: var(--max-lines);
		/* Turns out adding line-clamp breaks the return transition in Chrome */
		/* line-clamp: var(--max-lines); */

		max-block-size: calc(var(--max-lines) * 1lh);

		transition:
			max-block-size var(--transition-duration) ease-out,
			-webkit-line-clamp 0ms var(--transition-duration);

		transition-behavior: allow-discrete;

		&[data-open="true"] {
			-webkit-line-clamp: revert;
			/* line-clamp: revert; */
			max-block-size: max-content;

			transition-delay: 0ms;
		}
	}
</style>
