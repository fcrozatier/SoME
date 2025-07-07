<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		/**
		 * The side is the panel of fixed max width
		 */
		side: "left" | "right";
		/**
		 * The maximum size the the side panel
		 *
		 * Set as the `flex-basis` width
		 */
		sidePanelMaxWidth?: string;
		/**
		 * The minimum size of the main panel before it stacks
		 *
		 * Set as the `min-inline-size` as a length-percentage of the parent `<div>`
		 */
		mainPanelMinWidth: `${number}%` | (string & {});
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
		sidePanelMaxWidth,
		mainPanelMinWidth = "50%",
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
	style:--gap={`calc(var(--spacing) * ${gap});`}
	style:align-items={alignment}
>
	<div style={sidePanelMaxWidth ? `flex-basis: ${sidePanelMaxWidth}` : ""}>
		{@render sidePanel()}
	</div>
	<div style:min-inline-size={`min(${mainPanelMinWidth}, 100%)`}>{@render mainPanel()}</div>
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
