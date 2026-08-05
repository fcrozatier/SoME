<script lang="ts">
	import { formatTitle } from "$lib/utils/formatting";
</script>

<svelte:head>
	<title>{formatTitle("Change Password")}</title>
</svelte:head>

<article class="layout-prose">
	<h2>Password successfully reset!</h2>
	<p>You can now log in with your new password</p>
	<p>
		<a href={"/login"}>Login</a>
	</p>
</article>
