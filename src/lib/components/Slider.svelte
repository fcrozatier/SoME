<script lang="ts">
	export let name: string;
	export let value: number;
	export let labelLeft = '';
	export let labelCenter = '';
	export let labelRight = '';
</script>

<div class="w-full flex justify-between text-xs px-1">
	<span>{labelLeft}</span>
	<span>{labelCenter}</span>
	<span>{labelRight}</span>
</div>
<input
	id={name}
	{name}
	type="range"
	min="1"
	max="10"
	step="any"
	class="range range-sm"
	bind:value
	class:range-error={value <= 3}
	class:range-success={value > 7}
	class:range-warning={value > 3 && value <= 7}
	required
/>
<div class="w-full flex justify-between text-xs pl-2">
	{#each Array.from({ length: 10 }) as _, i}
		<button type="button" on:click={() => (value = i + 1)}>{i + 1}</button>
	{/each}
</div>
