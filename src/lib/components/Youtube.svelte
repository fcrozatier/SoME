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

<lite-youtube {videoid} videotitle={title} autoload>
	<a class="lite-youtube-fallback" href={`https://www.youtube.com/watch?v=${videoid}`}>
		Watch on YouTube: {title}
	</a>
</lite-youtube>

<style>
	lite-youtube {
		border-radius: var(--radius-lg);
	}

	.lite-youtube-fallback {
		aspect-ratio: 16 / 9; /* matches YouTube player */
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		gap: 1em;
		padding: 1em;
		background-color: #000;
		color: #fff;
		text-decoration: none;
	}

	/* right-facing triangle "Play" icon */
	.lite-youtube-fallback::before {
		display: block;
		content: "";
		border: solid transparent;
		border-width: 2em 0 2em 3em;
		border-left-color: red;
	}

	.lite-youtube-fallback:hover::before {
		border-left-color: #fff;
	}

	.lite-youtube-fallback:focus {
		outline: 2px solid red;
	}
</style>
