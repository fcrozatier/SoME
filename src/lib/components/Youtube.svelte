<script lang="ts">
	interface Props {
		src: string;
		title?: string;
	}

	let { src, title }: Props = $props();

	let videoid = src.split("/").at(-1);
</script>

<!-- TODO remove -->
<!-- <iframe
	{width}
	class="aspect-video rounded-lg"
	{src}
	title="YouTube video player"
	frameborder="0"
	allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
	referrerpolicy="strict-origin-when-cross-origin"
	allowfullscreen
	loading="lazy"
></iframe> -->

<lite-youtube {videoid} videotitle={title} autoload></lite-youtube>

<style>
	lite-youtube {
		border-radius: var(--radius-lg);
	}
</style>
