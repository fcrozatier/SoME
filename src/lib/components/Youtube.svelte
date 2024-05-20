<script lang="ts">
	export let src: string;
	export let width = 420;
</script>

<iframe
	{width}
	class="aspect-video rounded-lg"
	{src}
	title="YouTube video player"
	frameborder="0"
	allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
	referrerpolicy="strict-origin-when-cross-origin"
	allowfullscreen
	loading="lazy"
></iframe>
