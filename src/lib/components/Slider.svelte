<script lang="ts">
	import type { Attachment } from "svelte/attachments";

	let { ready = $bindable(false) } = $props();

	const values = Array.from({ length: 9 }, (_, i) => i + 1);

	let _grade = $state(5);

	const grade = {
		get value() {
			return _grade;
		},
		set value(g) {
			_grade = g;

			// Unfortunately we can't color-mix() with more than 2 colors (yet?)
			if (_grade < 5) {
				wrapper?.style.setProperty(
					"--color",
					`color-mix(in oklch, var(--color-error), var(--color-warning) ${(2 * 100 * (_grade - 1)) / 8}%`,
				);
			} else {
				wrapper?.style.setProperty(
					"--color",
					`color-mix(in oklch, var(--color-warning), var(--color-success) ${2 * ((100 * (_grade - 1)) / 8 - 50)}%)`,
				);
			}
		},
	};

	let displayGrade = $derived(grade.value.toFixed(2));

	const makeReady: Attachment = (node) => {
		const setReady = () => {
			ready = true;
			if (input) {
				input.style.appearance = "auto";
			}
		};
		node.addEventListener("pointerdown", setReady, { once: true });

		() => {
			node.removeEventListener("pointerdown", setReady);
		};
	};

	let input: HTMLInputElement | undefined = $state();
	let wrapper: HTMLDivElement | undefined = $state();

	$effect(() => {
		// JS-only enhanced input

		if (input) {
			// We need this to initially hide the thumb to create an unset state on the range
			// But this would make the input unusable in no-js scenarios so we style it from inside an effect
			input.style.appearance = "none";

			// But then going from appearance none to auto on the first click only wakes up the input, we have to delay setting the grade the first time around
			input.addEventListener(
				"pointerdown",
				(e) => {
					ready = true;
					const input = e.target as HTMLInputElement;
					input.style.appearance = "auto";
					const width = input.getBoundingClientRect().width;

					setTimeout(() => {
						const rawGrade = (e.offsetX / width) * 8 + 1;
						// For some reason we need to tweak the offset
						const delta = Math.abs(rawGrade - 5) / 100;
						grade.value = rawGrade * (rawGrade > 5 ? 1 + 0.2 * delta : 1 - delta);
					}, 0);
				},
				{ once: true },
			);
		}
	});
</script>

<div id="wrapper" style:--grade={grade.value} bind:this={wrapper}>
	<input
		id="score"
		type="range"
		list="values"
		min="1"
		max="9"
		step="0.01"
		bind:value={grade.value}
		bind:this={input}
	/>
	{#if ready}
		<span id="track"></span>
		<span id="thumb"></span>
		<span id="grade">{displayGrade}</span>
	{/if}
	<datalist id="values">
		{#each values as value}
			<option {value}>{value}</option>
		{/each}
	</datalist>
</div>

<div id="labels" class="w-full flex justify-between text-xs px-1 pb-2">
	<label
		for="score"
		class="-left-0.5 sm:-left-0"
		onpointerdown={() => (grade.value = 1)}
		{@attach makeReady}>Notably worse</label
	>
	<label for="score" class="sm:-left-2" onpointerdown={() => (grade.value = 3)} {@attach makeReady}
		>Not as good</label
	>
	<label for="score" class="sm:-right-2" onpointerdown={() => (grade.value = 5)} {@attach makeReady}
		>About the same</label
	>
	<label
		for="score"
		class="-right-0.5 sm:-right-4"
		onpointerdown={() => (grade.value = 7)}
		{@attach makeReady}>Better than most</label
	>
	<label
		for="score"
		class="-right-1 sm:-right-0"
		onpointerdown={() => (grade.value = 9)}
		{@attach makeReady}>Outstanding</label
	>
</div>

<style>
	label {
		cursor: pointer;
		text-wrap: nowrap;
		position: relative;
		transform-origin: left;
		margin-top: calc(var(--spacing) * 4);

		@media (width < 40rem /* 640px */) {
			writing-mode: vertical-rl;
		}
	}

	#wrapper {
		--percent: calc(100% * (var(--grade) - 1) / 8);
		--color: color-mix(in oklch, var(--color-error), var(--color-success) var(--percent));

		--thumb-size: 1.5em;
		--thumb-color: var(--color);

		--track-height: 1em;
		--track-bg: var(--color);

		/* The part of the track not highlighted */
		--track-height-remaining: 0.5em;
		--track-bg-remaining: color-mix(in lch, var(--track-bg) 20%, transparent 80%);

		display: flex;
		align-items: center;
		position: relative;
	}

	input {
		display: inline-block;
		width: 100%;
		height: var(--track-height);
		cursor: pointer;
		color: black;

		outline: none;
		border-radius: 1em;

		&:focus-visible {
			outline: 2px solid var(--track-bg);
			outline-offset: 3px;
		}

		&:disabled {
			cursor: not-allowed;
			opacity: 30%;
		}

		&::-webkit-slider-thumb {
			opacity: 0;
			transform: translateY(-0.25em);
		}

		&::-webkit-slider-runnable-track {
			border-radius: 1em;
			background-color: var(--track-bg-remaining);
			height: var(--track-height-remaining);
		}

		&::-moz-range-thumb {
			opacity: 0;
		}

		&::-moz-range-track {
			background-color: var(--track-bg-remaining);
			height: var(--track-height-remaining);
			border-radius: 1em;
		}
	}

	#thumb,
	#grade {
		position: absolute;
		display: inline-block;
		left: calc((var(--grade) - 1) / 8 * 100%);
		pointer-events: none;
	}

	#thumb {
		width: var(--thumb-size);
		height: var(--thumb-size);
		background-color: var(--thumb-color);
		border-radius: 50%;
		top: 0;
		transform: translateX(calc((var(--grade) - 1) / 8 * var(--thumb-size) * -1)) translateY(-0.25em);
		box-shadow:
			inset 0px 0px 0px 8px #fff,
			0px 0px 0px 2px rgba(0, 0, 0, 0.1);
	}

	#grade {
		top: -200%;
		left: calc((var(--grade) - 1) / 8 * 100% - 1ch);
		font-variant-numeric: tabular-nums;
		transform: translateX(calc((var(--grade) - 1) / 8 * -1.5em));
		padding-inline: 0.5em;
	}

	#track {
		position: absolute;
		display: inline-block;
		left: 0;
		height: var(--track-height);
		width: calc(1em + (var(--grade) - 1) / 8 * (100% - 1em));
		border-radius: 1em;
		background-color: var(--track-bg);
		pointer-events: none;
	}
</style>
