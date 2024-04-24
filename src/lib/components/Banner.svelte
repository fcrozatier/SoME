<script>
	export let test = false;
</script>

{#if test}
	<div class="alert alert-error mx-auto max-w-2xl text-sm">
		The Peer Review website is currently undergoing a beta test. If you would like to help with the
		test, please submit your favorite 3blue1brown video or blog post as an entry and participate in
		each phase of the competition!
	</div>
{/if}
