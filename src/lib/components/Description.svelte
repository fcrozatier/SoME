<script lang="ts">
	let { content }: { content: string } = $props();

	let open = $state(false);

	let description: HTMLElement | undefined = $state();
	let more: HTMLDivElement | undefined = $state();
	const clamped = $derived(description && description.clientHeight < description.scrollHeight);

	$effect(() => {
		if (!clamped) {
			more?.remove();
		}
	});
</script>

<div class="mb-12">
	<div>
		<p id="description" aria-expanded={open} bind:this={description}>
			{content}
		</p>

		<div class={"flex justify-between items-center "} bind:this={more}>
			<hr />
			<button
				class="btn btn-outline btn-sm px-10 border-gray-300"
				onclick={() => (open = !open)}
				aria-controls="description"
				aria-expanded={open}>{open ? "Less..." : "More..."}</button
			>
			<hr />
		</div>
	</div>
</div>

<style>
	p {
		position: relative;
		display: block;
		transition: height 500ms ease;
		overflow: hidden;
		height: 3lh;

		&[aria-expanded="true"] {
			height: auto;
		}
	}

	hr {
		margin-block: 0;
		width: 100%;
		background-color: var(--color-gray-50);
	}
</style>
