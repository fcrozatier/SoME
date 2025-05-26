<script lang="ts">
		import { setTitle } from "$lib/utils/setTitle";

	setTitle("Change Password");
</script>

<article class="layout-prose">
	<h2>Password successfully reset!</h2>
	<p>You can now log in with your new password</p>
	<p>
		<a href={"/login"}>Login</a>
	</p>
</article>
