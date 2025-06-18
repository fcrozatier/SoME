<script lang="ts">
	let { class: className }: { class: string } = $props();
</script>

<svg class={`${className}`} viewBox="0 0 100 100">
	<circle cx="50" cy="50" r="45" />
</svg>

<style>
	svg {
		animation: 2s linear infinite svg-animation;
	}

	@keyframes svg-animation {
		0% {
			transform: rotateZ(0deg);
		}
		100% {
			transform: rotateZ(360deg);
		}
	}

	circle {
		animation: 1.4s ease-in-out infinite both circle-animation;
		display: inline-block;
		fill: transparent;
		stroke-linecap: round;
		stroke-dasharray: 283;
		stroke-dashoffset: 280;
		transform-origin: center center;
	}

	@keyframes circle-animation {
		0%,
		25% {
			stroke-dashoffset: 280;
			transform: rotateZ(0);
		}

		50%,
		75% {
			stroke-dashoffset: 75;
			transform: rotateZ(45deg);
		}

		100% {
			stroke-dashoffset: 280;
			transform: rotateZ(360deg);
		}
	}
</style>
