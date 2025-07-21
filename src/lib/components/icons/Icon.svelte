<script lang="ts">
	import type { SVGAttributes } from "svelte/elements";
	import type { IconName } from "./Icons.svelte";

	interface IconProps
		extends Omit<
			SVGAttributes<SVGSVGElement>,
			"aria-hidden" | "class" | "fill" | "name" | "stroke" | "stroke-width" | "viewBox" | "xmlns"
		> {
		class?: string;
		name: IconName;
	}

	let { class: className = "", name, ...rest }: IconProps = $props();
</script>

<!-- @component
  ## Icon

  ### Sizing

  Use the `size-*` utilities for sizing

  Note: for inline SVG any CSS sizing overrides the `width` and `height` attributes

  Default width / height: 1em

  ### Theming

  Use `fill-*` and `stroke-*` utilities for theming

  Default stroke: `currentColor`
  Default fill: `none`
-->

<svg
	xmlns="http://www.w3.org/2000/svg"
	class={className}
	width="1em"
	height="1em"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	viewBox="0 0 24 24"
	{...rest}
>
	<use href={`#${name}`} />
</svg>

<style>
	svg {
		/* improved vertical alignment, removed inline-block margin, ensured currentColor is picked in forced-color mode  */

		display: inline-block;
		margin-bottom: 0;
		vertical-align: sub;
		forced-color-adjust: auto;
	}
</style>
