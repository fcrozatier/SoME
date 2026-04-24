<script lang="ts">
	interface Props {
		src: string;
		title?: string;
	}

	let { src, title }: Props = $props();
</script>

<!-- @component
 Attributes: https://github.com/justinribeiro/lite-youtube
 -->
<lite-youtube videoid={src.split("/").at(-1)} videotitle={title} autoload></lite-youtube>

<style>
	lite-youtube {
		border-radius: var(--radius-lg);
	}
</style>
