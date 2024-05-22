<script lang="ts">
	export let name: string;
	export let value = 5;

	export let labelTopLeft = '';
	export let labelTopCenter = '';
	export let labelTopRight = '';
	export let labelBottomLeft = '';
	export let labelBottomRight = '';
</script>

<div class="w-full flex justify-between text-xs px-1 pb-1">
	<button type="button" class="relative -left-1" on:click={() => (value = 1)}>{labelTopLeft}</button
	>
	<button type="button" class="hidden sm:block relative -left-1" on:click={() => (value = 3)}
		>{labelBottomLeft}</button
	>
	<button type="button" class="relative -right-2" on:click={() => (value = 5)}
		>{labelTopCenter}</button
	>
	<button type="button" class="hidden sm:block relative -right-4" on:click={() => (value = 7)}
		>{labelBottomRight}</button
	>
	<button type="button" class="relatite -right-0" on:click={() => (value = 9)}
		>{labelTopRight}</button
	>
</div>
<input
	id={name}
	{name}
	type="range"
	min="1"
	max="9"
	step=".01"
	class="range range-sm"
	bind:value
	class:range-error={value <= 3}
	class:range-success={value >= 7}
	class:range-warning={value > 3 && value < 7}
	required
/>
<div class="w-full flex justify-between text-xs px-2">
	{#each Array.from({ length: 9 }) as _, i}
		<button type="button" on:click={() => (value = i + 1)}>{i + 1}</button>
	{/each}
</div>
<div class="w-full flex justify-between text-xs px-1">
	<span></span>
	<button type="button" class="sm:hidden" on:click={() => (value = 3)}>{labelBottomLeft}</button>
	<span></span>
	<button type="button" class="sm:hidden" on:click={() => (value = 7)}>{labelBottomRight}</button>
	<span></span>
</div>

<p class="">
	Score: {value}
</p>
