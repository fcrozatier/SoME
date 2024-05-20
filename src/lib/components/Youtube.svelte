<script lang="ts">
	export let src: string;
</script>

<iframe
	width="420"
	class="aspect-video rounded-lg"
	{src}
	title="YouTube video player"
	frameborder="0"
	allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
	allowfullscreen
	loading="lazy"
/>
