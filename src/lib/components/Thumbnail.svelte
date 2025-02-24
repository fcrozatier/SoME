<script lang="ts">
	import { PUBLIC_S3_BUCKET, PUBLIC_S3_ENDPOINT } from '$env/static/public';

	interface Props {
		uid: string;
		width?: number;
	}

	let { uid, width = 480 }: Props = $props();
</script>

<img
	class="my-0 max-w-full rounded-lg aspect-video"
	src={`https://${PUBLIC_S3_BUCKET}.${PUBLIC_S3_ENDPOINT.replace('https://', '')}/${uid}`}
	alt="thumbnail"
	loading="lazy"
	{width}
/>
