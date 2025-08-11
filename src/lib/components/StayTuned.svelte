<script lang="ts">
	import { enhance } from "$app/forms";
	import { disableSubmitterAndSetValidity } from "$lib/actions";
	import { nanoId } from "@fcrozatier/ts-helpers";

	let { form } = $props();
</script>

<form
	class="grid justify-center"
	method="post"
	action="?/newsletter"
	use:enhance={disableSubmitterAndSetValidity({
		toast: { success: "You'll be notified of future editions! 🎉" },
	})}
>
	<h3 id="stay-tuned-{nanoId()}">Receive News on Upcoming Editions</h3>
	<div class="flex gap-2">
		<input
			type="email"
			name="email"
			class="input input-bordered"
			placeholder="Email"
			aria-label="Email"
			aria-describedby="stay-tuned"
			maxlength="128"
			required
		/>
		<button type="submit" class="btn">Stay updated</button>
	</div>
	{#if form && !form.success}
		<div class="text-sm pt-1 font-medium text-error">
			{form.issues?.email?.message}
		</div>
	{/if}
</form>
