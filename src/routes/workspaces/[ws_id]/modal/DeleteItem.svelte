<script lang="ts">
	import type { DsAction } from '@hexabase/hexabase-js/dist/lib/types/datastore';
	import type { DeleteItemReq } from '@hexabase/hexabase-js/dist/lib/types/item';
	import { datastoreService, itemsService } from '../+page';

	export let isDeleteOpen;
	export let curDatastoreId = '';
	export let curProjectId = '';
	export let fetchItems: any;

	let tableLoading = false;

	const deleteItem = async (item: any) => {
		console.log('itemitemitem', item);
		tableLoading = true;
		const dsActions: DsAction[] = await datastoreService.getActions(curDatastoreId);
		const actionIdDelete = dsActions.find(
			(action) => action?.operation?.trim().toLowerCase() === 'delete'
		)?.action_id;
		if (actionIdDelete) {
			const deleteItemReq: DeleteItemReq = {
				a_id: actionIdDelete,
				use_display_id: true,
				delete_linked_items: true
			};
			await itemsService.deleteItem(curProjectId, curDatastoreId, item.i_id, deleteItemReq);
		}
		await fetchItems();
		tableLoading = false;
	};
</script>

<div class="flex flex-col gap-8">
	<div class="text-sm font-semibold" id="dialog-title-id">
		<div class="text-red-400 text-sm italic font-light">
			This action is undoable, take it carefully!
		</div>
		Are you sure you want to delete this item
	</div>
	<div class="flex justify-between w-full">
		<button
			type="button"
			class="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-md text-sm px-3 py-1 text-center"
			on:click={deleteItem}>Delete</button
		>
		<button
			class="px-3 py-1 bg-slate-200 rounded-md"
			on:click={() => {
				isDeleteOpen = false;
			}}>Cancel</button
		>
	</div>
</div>
