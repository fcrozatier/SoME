<script lang="ts">
	import Time from "$lib/components/Time.svelte";

	let { data } = $props();
</script>

<article class="mx-auto w-4/5 max-w-5xl overflow-x-auto">
	<h2>Deleted Users</h2>

	<div class="overflow-x-auto">
		<table class="w-full">
			<thead>
				<tr class="px-6">
					<th>id</th>
					<th>Username</th>
					<th>Deleted</th>
				</tr>
			</thead>
			<tbody>
				{#each data.deletedUsers as { uid, username, deleted_at }}
					<tr class="px-6 py-2 border-b-0">
						<td>{uid} </td>
						<td>{username}</td>
						<td class="text-nowrap">
							{#if deleted_at}
								<Time datetime={deleted_at} includeTime={false}></Time>
							{:else}
								-
							{/if}
						</td>
					</tr>
				{:else}
					<tr>
						<td>
							<p>No entries to review</p>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</article>
