<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<article class="layout-prose">
	{#if data.info}
		<h2>DB is live</h2>

		<p>agent: {data.info.agent}</p>
		<p>protocolVersion: {data.info.protocolVersion}</p>
	{:else}
		<h2>Failed to connect to DB</h2>
	{/if}
</article>
