<script lang="ts">
	import { enhance } from "$app/forms";
	import { newToast } from "./Toasts.svelte";

	let { form } = $props();
</script>

<form
	class="grid justify-center"
	method="post"
	action="?/newsletter"
	use:enhance={({ submitter }) => {
		submitter?.setAttribute("disabled", "on");

		return async ({ result, update }) => {
			submitter?.removeAttribute("disabled");
			await update();

			if (result.type === "success") {
				newToast({
					type: "success",
					content: "You'll be notified of future editions! 🎉",
				});
			}
		};
	}}
>
	<h3 id="stay-tuned">Receive News on Upcoming Editions</h3>
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
