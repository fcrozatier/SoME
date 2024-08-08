<script lang="ts">
	export let pages: number;
	export let pageNumber = '1';
	export let onChange = () => {};
</script>

<div class="mt-10 mx-auto flex justify-center">
	{#if pages > 1}
		<form class="join" on:change={onChange}>
			{#each new Array(pages) as _, i}
				<div class="pagination-grid">
					<label
						for={`radio${i}`}
						class="join-item btn z-10"
						class:btn-primary={i + 1 === +pageNumber}
						>{i + 1}
					</label>
					<input
						id={`radio${i}`}
						type="radio"
						name="pagination"
						value={i + 1}
						bind:group={pageNumber}
					/>
				</div>
			{/each}
		</form>
	{/if}
</div>

<style>
	.pagination-grid {
		display: grid;
		place-items: center;

		& > * {
			grid-area: 1/1;
		}
	}
</style>
