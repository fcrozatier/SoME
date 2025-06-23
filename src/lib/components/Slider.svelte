<script lang="ts">
	interface Props {
		name: string;
		value: number;
		ready?: boolean;
		label1?: string;
		label3?: string;
		label5?: string;
		label7?: string;
		label9?: string;
	}

	let {
		name,
		value = $bindable(),
		ready = $bindable(false),
		label1 = "",
		label3 = "",
		label5 = "",
		label7 = "",
		label9 = "",
	}: Props = $props();

	let input: HTMLInputElement | undefined = $state();

	function label(value: number) {
		if (value < 1.5) return label1;
		if (value < 2.5) return label3 + "-";
		if (value < 3.5) return label3;
		if (value < 4.5) return label5 + "-";
		if (value < 5.5) return label5;
		if (value < 6.5) return label5 + "+";
		if (value < 7.5) return label7;
		if (value < 8.5) return label7 + "+";
		return label9;
	}

	const changeValue = (newValue: number) => {
		value = newValue;
		ready = true;
	};
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
				onpointerdown={() => changeValue(1)}>{label1}</label
			>
			<label
				for={name}
				class="cursor-pointer rotate-90 sm:rotate-0 text-nowrap origin-left sm:block relative -left-1"
				onpointerdown={() => changeValue(3)}>{label3}</label
			>
			<label
				for={name}
				class="cursor-pointer rotate-90 sm:rotate-0 text-nowrap origin-left relative -right-2"
				onpointerdown={() => changeValue(5)}>{label5}</label
			>
			<label
				for={name}
				class="cursor-pointer rotate-90 sm:rotate-0 text-nowrap origin-left sm:block relative -right-4"
				onpointerdown={() => changeValue(7)}>{label7}</label
			>
			<label
				for={name}
				class="cursor-pointer rotate-90 sm:rotate-0 text-nowrap origin-left relatite -right-0"
				onpointerdown={() => changeValue(9)}>{label9}</label
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
				class="range w-full"
				bind:value
				bind:this={input}
				onchange={() => (ready = true)}
				class:range-error={value <= 3}
				class:range-success={value >= 7}
				class:range-warning={value > 3 && value < 7}
				required
			/>
		</div>
	</div>
</div>

<p class="">
	Your estimation: <span class="font-semibold">{ready ? label(value) : "Please make a choice"}</span
	>
</p>
