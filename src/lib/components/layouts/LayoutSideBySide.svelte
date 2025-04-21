<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		sideWidth?: string;
		contentMinSize: `${number}%`;
		sidePanel: Snippet;
		mainPanel: Snippet;
	}

	let { sideWidth, contentMinSize = "50%", sidePanel, mainPanel }: Props = $props();
</script>

<div data-layout="side-by-side">
	<div style={sideWidth ? `flex-basis: ${sideWidth}` : ""}>{@render sidePanel()}</div>
	<div style={`min-inline-size: ${contentMinSize}`}>{@render mainPanel()}</div>
</div>

<style>
	[data-layout="side-by-side"] {
		display: flex;
		flex-wrap: wrap;
		gap: calc(var(--spacing) * 4);
		align-items: flex-start;

		& > :first-child {
			flex-grow: 1;
		}

		& > :last-child {
			flex-basis: 0;
			flex-grow: 9999;
		}
	}
</style>
