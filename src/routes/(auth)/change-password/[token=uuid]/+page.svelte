<script lang="ts">
	import { makeTitle } from "$lib/utils/makeTitle";
</script>

<svelte:head>
	<title>{makeTitle("Change Password")}</title>
</svelte:head>

<article class="layout-prose">
	<h2>Password successfully reset!</h2>
	<p>You can now log in with your new password</p>
	<p>
		<a href={"/login"}>Login</a>
	</p>
</article>
