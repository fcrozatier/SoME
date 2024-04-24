<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<article class="layout-prose">
	<h2>Database setup</h2>
	{#if data.success}
		<p>Database constraints added successfully</p>
	{:else}
		<p>Something went wrong when creating db constraints</p>
	{/if}
</article>
