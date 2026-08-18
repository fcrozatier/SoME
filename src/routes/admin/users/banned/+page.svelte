<script lang="ts">
	let { data } = $props();
</script>

<article class="mx-auto w-4/5 max-w-5xl overflow-x-auto">
	<h2>Banned users</h2>

	<div class="overflow-x-auto">
		<table class="w-full">
			<thead>
				<tr class="px-6">
					<th>User</th>
					<th>Reason</th>
					<th>Message</th>
					<th class="text-nowrap">Expires at</th>
				</tr>
			</thead>
			<tbody>
				{#each data.bannedUsers as user}
					<tr class="px-6 py-2 border-b-0">
						<td>{user.username}</td>
						<td>{user.reason} </td>
						<td>{user.message} </td>
						<td>{user.expires_at} </td>
					</tr>
				{:else}
					<tr>
						<td>
							<p>No banned users to review</p>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</article>
