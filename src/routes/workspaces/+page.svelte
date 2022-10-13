<script lang="ts">
	import { workspaceService } from './+page';
	// import Workspace from 'hexabase/hexabase-js/dist/lib/types/workspace/response.d.ts';

	const fetchData = (async () => {
		const workspaces = await workspaceService.getWorkspaces();
		return workspaces;
	})();
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://demos.creative-tim.com/notus-js/assets/styles/tailwind.css"
	/>
	<link
		rel="stylesheet"
		href="https://demos.creative-tim.com/notus-js/assets/vendor/@fortawesome/fontawesome-free/css/all.min.css"
	/>
</svelte:head>

<div class="block w-full overflow-x-auto">
	{#await fetchData}
		<p>...fetching data</p>
	{:then workspaces}
		<table class="items-center bg-transparent w-full border-collapse ">
			<thead>
				<tr>
					<th
						class="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left"
					>
						Name
					</th>
					<th
						class="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left"
					>
						Workspace ID
					</th>
				</tr>
			</thead>

			<tbody>
				{#each workspaces.workspaces as workspace}
					<tr>
						<td
							class="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left text-blueGray-700 "
						>
							{workspace.workspace_name}
						</td>
						<td
							class="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 "
						>
							{workspace.workspace_id}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:catch error}
		<p>An error occurred!</p>
	{/await}
</div>
