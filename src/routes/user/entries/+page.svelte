<script lang="ts">
	import { PUBLIC_REGISTRATION_START } from "$env/static/public";

	import Time from "$lib/components/Time.svelte";
</script>

<article class="layout-prose">
	<h2>My entries</h2>
	<p>No entry submitted</p>
	<p>
		Submissions will open on <strong><Time datetime={PUBLIC_REGISTRATION_START} /></strong>.
	</p>
	<p>
		<button class="btn btn-neutral" disabled>New entry</button>
	</p>
	<!-- <p>
		The submission deadline is <strong><Time datetime={PUBLIC_REGISTRATION_END} /></strong>.
	</p> -->
</article>
