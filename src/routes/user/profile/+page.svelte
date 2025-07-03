<script lang="ts">
	import { makeTitle } from "$lib/utils/makeTitle.js";

	const { data } = $props();
</script>

<svelte:head>
	<title>{makeTitle("Profile")}</title>
</svelte:head>

<article class="layout-prose">
	<h2>Profile</h2>
	<ul class="not-prose">
		<li>
			Username: {data.user.username}
		</li>
		<li>
			Email: {data.user.email}
		</li>
		<li>
			Teacher: {data.user.isTeacher}
		</li>
	</ul>
	<p>
		<a href="/logout" class="btn" data-sveltekit-preload-data="off" data-sveltekit-reload
			>Sign out</a
		>
	</p>
</article>
