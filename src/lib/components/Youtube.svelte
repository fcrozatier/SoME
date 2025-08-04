<script lang="ts">
	interface Props {
		src: string;
		title?: string;
	}

	let { src, title }: Props = $props();

	let videoid = src.split("/").at(-1);
</script>

<!-- @component
 Attributes: https://github.com/justinribeiro/lite-youtube
 -->
<lite-youtube {videoid} videotitle={title} autoload></lite-youtube>

<style>
	lite-youtube {
		border-radius: var(--radius-lg);
	}
</style>
