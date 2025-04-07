<script lang="ts" module>
	import { SHORT_NAME } from '$lib/config';

	export { titleSnippet };
</script>

{#snippet titleSnippet(t: string)}
	<title>{t} &middot; {SHORT_NAME}</title>
{/snippet}
