<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<article class="layout-prose">
	<h2>Fixtures</h2>

	{#if data.success}
		<p>Successfully added fixtures to db</p>
	{:else}
		<p>Something went wrong when adding fixtures to db</p>
	{/if}
	<p />
</article>
