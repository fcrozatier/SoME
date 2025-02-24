<script lang="ts">
	interface Props {
		datetime: string;
		time?: boolean;
		options?: Intl.DateTimeFormatOptions | undefined;
	}

	let { datetime, time = true, options = undefined }: Props = $props();

	const intl = new Intl.DateTimeFormat(
		'en',
		options ?? {
			// weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: time ? 'numeric' : undefined,
			minute: time ? 'numeric' : undefined,
		},
	);
</script>

<time {datetime}>
	{intl.format(Date.parse(datetime))}
</time>
