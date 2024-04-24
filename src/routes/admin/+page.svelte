<script lang="ts">
	import { dev } from '$app/environment';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<article class="layout-prose">
	<h2>Admin area</h2>
	<h3>Setup</h3>
	<ul class="space-y-4">
		<li><a href="/admin/testdb">Test db connection</a></li>
		<li>
			<a href="/admin/db-setup" class="hover:cursor-not-allowed" on:click|preventDefault
				>Add db constraints and background job</a
			>
		</li>
		{#if dev}
			<li><a href="/admin/fixtures">Add db fixtures (dev mode)</a></li>
		{/if}
	</ul>

	<h3>Review</h3>
	<ul>
		<li><a href="/admin/flagged">Flags</a></li>
		<li><a href="/admin/feedbacks">Feedbacks</a></li>
	</ul>

	<h3>Manage</h3>
	<ul>
		{#if data.isAdmin}
			<li><a href="/admin/analytics">Graph analytics</a></li>
			<li><a href="/admin/swap">Swap entries</a></li>
			<li><a href="/admin/mailing">Send email</a></li>
			<!-- <li><a href="/admin/rank">Rank entries</a></li> -->
		{/if}
	</ul>
</article>
