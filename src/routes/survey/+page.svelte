<script lang="ts">
	import { enhance } from "$app/forms";
	import { goto } from "$app/navigation";
	import { newToast } from "$lib/components/Toasts.svelte";
	import { makeTitle } from "$lib/utils/makeTitle.js";
	import { SurveySchema } from "$lib/validation";
	import * as fg from "formgator";

	let { form } = $props();

	let someValue = $state(5);
	let siteValue = $state(5);
	let feedback = $state("");
</script>

<svelte:head>
	<title>{makeTitle("Survey")}</title>
</svelte:head>

<article class="layout-prose">
	{#if !form?.surveySuccess}
		<h2>Survey</h2>

		<form
			method="post"
			class="space-y-4"
			use:enhance={({ submitter }) => {
				submitter?.setAttribute("disabled", "on");
				return async ({ update, result }) => {
					if (result.type === "success") {
						newToast({ type: "success", content: "Thank you for taking the survey! 🎉 🥳" });
						await goto("/");
					}
					submitter?.removeAttribute("disabled");
					await update();
				};
			}}
		>
			<div class="form-control gap-1">
				<label for="some" class="label flex gap-2">
					<span class="flex-1">
						How satisfied are you with the SoME event (communication/organization)?
					</span>
				</label>
				<input
					id="some"
					name="some"
					type="range"
					step=".01"
					class="range range-sm"
					bind:value={someValue}
					class:range-error={someValue <= 3}
					class:range-success={someValue > 7}
					class:range-warning={someValue > 3 && someValue <= 7}
					{...fg.splat(SurveySchema.some.attributes)}
				/>
				<div class="w-full flex justify-between text-xs px-1">
					{#each Array.from({ length: 9 }) as _, i}
						<button type="button" onclick={() => (someValue = i + 1)}>{i + 1}</button>
					{/each}
				</div>
				<div class="w-full flex justify-between text-xs px-1">
					<span>Not satisfied</span>

					<span>Very satisfied</span>
				</div>
			</div>
			<div class="form-control gap-1">
				<label for="site" class="label flex gap-2">
					<span class="flex-1">
						How satisfied are you with the Peer Review website this year?
					</span>
				</label>
				<input
					id="site"
					name="site"
					type="range"
					step=".01"
					class="range range-sm"
					bind:value={siteValue}
					class:range-error={siteValue <= 3}
					class:range-success={siteValue > 7}
					class:range-warning={siteValue > 3 && siteValue <= 7}
					{...fg.splat(SurveySchema.site.attributes)}
				/>
				<div class="w-full flex justify-between text-xs px-1">
					{#each Array.from({ length: 10 }) as _, i}
						<button type="button" onclick={() => (siteValue = i + 1)}>{i + 1}</button>
					{/each}
				</div>
				<div class="w-full flex justify-between text-xs px-1">
					<span>Not satisfied</span>

					<span>Very satisfied</span>
				</div>
			</div>
			<div class="form-control">
				<label for="feedback" class="label flex gap-2">
					<span class="flex-1">
						Do you have general feedback or ways you would like to see the Summer of Math Exposition
						improved next year? If so, please write it here:
					</span>
				</label>
				<textarea
					name="feedback"
					id="feedback"
					class="textarea-bordered textarea text-base"
					cols="50"
					rows="10"
					bind:value={feedback}
					{...fg.splat(SurveySchema.feedback.attributes)}
				></textarea>
				<div class="label justify-end">
					<span class="label-text-alt">{feedback.length}/5000</span>
				</div>
			</div>

			<p>
				<button class="btn btn-neutral">Submit survey</button>
			</p>
		</form>
	{/if}
</article>
