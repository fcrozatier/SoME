<script lang="ts">
	import { formatDateTime } from "$lib/utils/formatting";

	interface Props {
		datetime: string;
		options?: Intl.DateTimeFormatOptions | undefined;
		includeTime?: boolean;
	}

	let { datetime, options, includeTime }: Props = $props();
</script>

<time {datetime}>{formatDateTime(datetime, { ...options, includeTime })}</time>
