<script lang="ts">
	export let datetime: string;
	export let time = true;
	export let options: Intl.DateTimeFormatOptions | undefined = undefined;

	const intl = new Intl.DateTimeFormat(
		'en',
		options ?? {
			// weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: time ? 'numeric' : undefined,
			minute: time ? 'numeric' : undefined
		}
	);
</script>

<time {datetime}>
	{intl.format(Date.parse(datetime))}
</time>
