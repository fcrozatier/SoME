<script lang="ts">
	import { PUBLIC_S3_BUCKET, PUBLIC_S3_ENDPOINT } from '$env/static/public';

	export let uid: string;
	export let width = 480;
</script>

<img
	class="my-0 max-w-full rounded-lg aspect-video"
	src={`https://${PUBLIC_S3_BUCKET}.${PUBLIC_S3_ENDPOINT.replace('https://', '')}/${uid}`}
	alt="thumbnail"
	{width}
/>
