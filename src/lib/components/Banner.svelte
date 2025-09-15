<script lang="ts">
	interface Props {
		display?: boolean;
	}

	let { display = false }: Props = $props();
</script>

{#if display}
	<!-- <div class="alert alert-error mx-auto max-w-2xl text-sm">
		The Peer Review website is currently undergoing a beta test. If you would like to help with the
		test, please submit your favorite 3blue1brown video or blog post as an entry and participate in
		each phase of the competition!
	</div> -->
	<a
		href="/survey"
		class="flex alert no-underline font-semibold alert-warning mx-auto max-w-2xl text-sm sticky top-0 z-10"
	>
		<div class="">We'd love your feedback! Please take a minute to share your thoughts.</div>
		<span class="text-lg ml-auto">&rarr;</span>
	</a>
{/if}
