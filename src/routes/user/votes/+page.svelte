<script lang="ts">
	import { PUBLIC_VOTE_START } from "$env/static/public";

	import Time from "$lib/components/Time.svelte";
</script>

<article class="layout-prose">
	<h2>My votes</h2>
	<p>Here you'll be able to review all your votes, and change your mind on rankings</p>

	<p>No vote to display.</p>
	<p>
		The peer review will start on <strong><Time datetime={PUBLIC_VOTE_START} /></strong>.
	</p>
</article>
