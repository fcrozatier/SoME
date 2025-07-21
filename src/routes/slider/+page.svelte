<script lang="ts">
	import type { Attachment } from "svelte/attachments";

	const values = Array.from({ length: 9 }, (_, i) => i + 1);

	let ready = $state(false);
	let grade = $state(5);
	let displayGrade = $derived(grade.toFixed(2));

	const makeReady: Attachment = (node) => {
		const setReady = () => {
			ready = true;
		};
		node.addEventListener("pointerdown", setReady, { once: true });

		$effect(() => {
			if (ready) {
				node.removeEventListener("pointerdown", setReady);
			}
		});

		() => {
			node.removeEventListener("pointerdown", setReady);
		};
	};

	// We go from appearance none to auto since we initially hide the thumb, but then the first click only wakes up the input, we have to delay setting the grade the first time around
	const setupInput: Attachment<HTMLInputElement> = (input) => {
		input.addEventListener(
			"pointerdown",
			(e) => {
				ready = true;
				const width = (e.target as HTMLInputElement).getBoundingClientRect().width;

				setTimeout(() => {
					const rawGrade = (e.offsetX / width) * 8 + 1;
					// For some reason we need to tweak
					const delta = Math.abs(rawGrade - 5) / 100;
					grade = rawGrade * (rawGrade > 5 ? 1 + 0.2 * delta : 1 - delta);
				}, 0);
			},
			{ once: true },
		);
	};
</script>

<div class="mt-20"></div>

<div class="mx-10">
	<div id="wrapper">
		<input
			type="range"
			list="values"
			min="1"
			max="9"
			step="0.01"
			class={{ "appearance-none": !ready }}
			{@attach setupInput}
			bind:value={grade}
		/>
		{#if ready}
			<span id="track" style:--left={grade}></span>
			<span id="thumb" style:--left={grade}></span>
			<span id="grade" style:--left={grade}>{displayGrade}</span>
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
			onpointerdown={() => (grade = 1)}
			{@attach makeReady}>Notably worse</label
		>
		<label for="score" class="sm:-left-2" onpointerdown={() => (grade = 3)} {@attach makeReady}
			>Not as good</label
		>
		<label for="score" class="sm:-right-2" onpointerdown={() => (grade = 5)} {@attach makeReady}
			>About the same</label
		>
		<label
			for="score"
			class="-right-0.5 sm:-right-4"
			onpointerdown={() => (grade = 7)}
			{@attach makeReady}>Better than most</label
		>
		<label
			for="score"
			class="-right-1 sm:-right-0"
			onpointerdown={() => (grade = 9)}
			{@attach makeReady}>Outstanding</label
		>
	</div>
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
		--thumb-size: 1.5em;
		--thumb-color: var(--color-error);

		--track-height: 1em;
		--track-bg: var(--color-error);

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
			appearance: none;
			transform: translateY(-0.25em);
		}

		&::-webkit-slider-runnable-track {
			border-radius: 1em;
			background-color: var(--track-bg-remaining);
			height: var(--track-height-remaining);
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
		left: calc((var(--left) - 1) / 8 * 100%);
		pointer-events: none;
	}

	#thumb {
		width: var(--thumb-size);
		height: var(--thumb-size);
		background-color: var(--thumb-color);
		border-radius: 50%;
		top: 0;
		transform: translateX(calc((var(--left) - 1) / 8 * var(--thumb-size) * -1)) translateY(-0.25em);
		box-shadow:
			inset 0px 0px 0px 8px #fff,
			0px 0px 0px 2px rgba(0, 0, 0, 0.1);
	}

	#grade {
		top: -200%;
		left: calc((var(--left) - 1) / 8 * 100% - 1ch);
		font-variant-numeric: tabular-nums;
		transform: translateX(calc((var(--left) - 1) / 8 * -1.5em));
		padding-inline: 0.5em;
	}

	#track {
		position: absolute;
		display: inline-block;
		left: 0;
		height: var(--track-height);
		width: calc(1em + (var(--left) - 1) / 8 * (100% - 1em));
		border-radius: 1em;
		background-color: var(--track-bg);
		pointer-events: none;
	}
</style>
