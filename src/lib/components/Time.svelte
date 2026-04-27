<script lang="ts">
	interface Props {
		datetime: string;
		time?: boolean;
		options?: Intl.DateTimeFormatOptions | undefined;
	}

	let { datetime, time = true, options = undefined }: Props = $props();
</script>

<time {datetime}>
	{new Intl.DateTimeFormat(
		navigator.language,
		options ?? {
			// weekday: 'long',
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: time ? "numeric" : undefined,
			minute: time ? "numeric" : undefined,
		},
	).format(Date.parse(datetime))}
</time>
