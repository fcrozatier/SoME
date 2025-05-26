<script lang="ts">
	import { page } from "$app/state";
		import { setTitle } from "$lib/utils/setTitle";

	setTitle("Error");
</script>

<article class="layout-prose min-h-[100vh]">
	<h2>{page.status}</h2>
	<p>
		{page.error?.message}
	</p>
	<p>
		<a href="/">Back</a>
	</p>
</article>
