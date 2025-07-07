<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		/**
		 * The side is the column of fixed width
		 */
		side: "left" | "right";
		/**
		 * flex-basis width of the side
		 */
		sideWidth?: string;
		/**
		 * content min-inline-size as a percent of the parent containing both the side and the main content
		 */
		contentMinSize: `${number}%`;
		/**
		 * number on the --spacing scale
		 *
		 * gap: 4 corresponds to calc(var(--spacing) * 4)
		 */
		gap?: number;
		/**
		 * How items are aligned
		 *
		 * @default flex-start
		 */
		alignment?: "flex-start" | "center" | "flex-end";
		/**
		 * The `class` attribute of the container
		 */
		class?: string;
		sidePanel: Snippet;
		mainPanel: Snippet;
	}

	let {
		side = "left",
		gap = 4,
		sideWidth,
		contentMinSize = "50%",
		class: className = "",
		alignment = "flex-start",
		sidePanel,
		mainPanel,
	}: Props = $props();
</script>

<div
	class={className}
	data-reverse={side === "right"}
	data-layout="side-by-side"
	style={`--gap: calc(var(--spacing) * ${gap}); align-items: ${alignment}`}
>
	<div style={sideWidth ? `flex-basis: ${sideWidth}` : ""}>{@render sidePanel()}</div>
	<div style={`min-inline-size: ${contentMinSize}`}>{@render mainPanel()}</div>
</div>

<style>
	[data-layout="side-by-side"] {
		display: flex;
		flex-wrap: wrap;
		gap: var(--gap);

		& > :first-child {
			flex-grow: 1;
		}

		& > :last-child {
			flex-basis: 0;
			flex-grow: 9999;
		}

		&[data-reverse="true"] {
			flex-direction: row-reverse;

			& > :last-child {
				flex-grow: 1;
			}

			& > :first-child {
				flex-basis: 0;
				flex-grow: 9999;
			}
		}
	}
</style>
