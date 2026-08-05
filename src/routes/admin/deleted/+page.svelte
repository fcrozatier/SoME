<script lang="ts">
	import Time from "$lib/components/Time.svelte";

	let { data } = $props();
</script>

<article class="mx-auto w-4/5 max-w-5xl overflow-x-auto">
	<h2>Deleted entries</h2>

	<div class="overflow-x-auto">
		<table class="w-full">
			<thead>
				<tr class="px-6">
					<th>Entry</th>
					<th>Created</th>
					<th>Updated</th>
					<th>Deleted</th>
				</tr>
			</thead>
			<tbody>
				{#each data.inactiveEntries as { title, url, uid, created_at, updated_at, deleted_at }}
					{@const strikes = data.withStrikes[uid]}
					{@const flags = data.withFlags[uid]}

					<tr class="px-6 py-2 border-b-0">
						<td>
							<div>
								<a class="capitalize" href={url} target="_blank">{title}</a>
								<br /><span class="text-nowrap">{uid}</span>
							</div>
						</td>
						<td class="text-nowrap">
							{#if created_at}
								<Time datetime={created_at} includeTime={false}></Time>
							{:else}
								-
							{/if}
						</td>
						<td class="text-nowrap">
							{#if updated_at}
								<Time datetime={updated_at} includeTime={false}></Time>
							{:else}
								-
							{/if}
						</td>
						<td class="text-nowrap">
							{#if deleted_at}
								<Time datetime={deleted_at} includeTime={false}></Time>
							{:else}
								-
							{/if}
						</td>
					</tr>
					{#if strikes && strikes?.length > 0}
						<tr class="border-b-0">
							<td colspan="1">
								<div>
									<b>Strikes:</b>
									<ul>
										{#each strikes as { note, reason, state }}
											<li>
												<b>{reason}</b> ({state}):
												<div>
													<p class="alert mt-0 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
														{@html note}
													</p>
												</div>
											</li>
										{/each}
									</ul>
								</div>
							</td>
							<td></td>
							<td></td>
						</tr>
					{/if}
					{#if flags && flags.length > 0}
						<tr>
							<td colspan="5">
								<div>
									<b>Flags:</b>
									<ul>
										{#each flags as { reason }}
											<li>{reason}</li>
										{/each}
									</ul>
								</div>
							</td>
							<td></td>
							<td></td>
						</tr>
					{/if}
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
