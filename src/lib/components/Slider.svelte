<script lang="ts">
	export let name: string;
	export let value: number;
	export let ready = false;

	export let label1 = '';
	export let label3 = '';
	export let label5 = '';
	export let label7 = '';
	export let label9 = '';

	function label(value: number) {
		if (value < 1.5) return label1;
		if (value < 2.5) return label3 + '-';
		if (value < 3.5) return label3;
		if (value < 4.5) return label5 + '-';
		if (value < 5.5) return label5;
		if (value < 6.5) return label5 + '+';
		if (value < 7.5) return label7;
		if (value < 8.5) return label7 + '+';
		return label9;
	}
</script>

<div class="h-[400px] sm:h-auto py-10">
	<div
		class="-rotate-90 sm:rotate-0 w-[400px] sm:w-full h-[200px] sm:h-[100px] overflow-hidden -translate-x-20 translate-y-16 sm:translate-x-0 sm:translate-y-0"
	>
		<div
			class="w-full flex justify-between text-xs px-1 pb-2 sm:translate-x-0 sm:translate-y-0 translate-x-[2.2rem] translate-y-14 scale-110 sm:scale-100"
		>
			<label
				for={name}
				class="cursor-pointer rotate-90 sm:rotate-0 text-nowrap origin-left relative -left-1"
				on:pointerdown={() => (value = 1)}>{label1}</label
			>
			<label
				for={name}
				class="cursor-pointer rotate-90 sm:rotate-0 text-nowrap origin-left sm:block relative -left-1"
				on:pointerdown={() => (value = 3)}>{label3}</label
			>
			<label
				for={name}
				class="cursor-pointer rotate-90 sm:rotate-0 text-nowrap origin-left relative -right-2"
				on:pointerdown={() => (value = 5)}>{label5}</label
			>
			<label
				for={name}
				class="cursor-pointer rotate-90 sm:rotate-0 text-nowrap origin-left sm:block relative -right-4"
				on:pointerdown={() => (value = 7)}>{label7}</label
			>
			<label
				for={name}
				class="cursor-pointer rotate-90 sm:rotate-0 text-nowrap origin-left relatite -right-0"
				on:pointerdown={() => (value = 9)}>{label9}</label
			>
		</div>
		<div class="h-[500px]">
			<input
				id={name}
				{name}
				type="range"
				min="1"
				max="9"
				step=".01"
				class="range"
				bind:value
				on:click={() => (ready = true)}
				class:range-error={value <= 3}
				class:range-success={value >= 7}
				class:range-warning={value > 3 && value < 7}
				required
			/>
		</div>
	</div>
</div>

<p class="">
	Your estimation: <span class="font-semibold">{ready ? label(value) : 'Please make a choice'}</span
	>
</p>
