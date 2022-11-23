<script lang="ts">
	import Paragraph from '$lib/components/skeleton/Paragraph.svelte';
	import type { DsAction } from '@hexabase/hexabase-js/dist/lib/types/datastore';
	import type { DeleteItemReq } from '@hexabase/hexabase-js/dist/lib/types/item';
	import { getClose } from 'svelte-dialogs';
	import { datastoreService, itemsService } from '../+page';

	export let isDeleteOpen;
	export let fetchItems: any;
	export let item: any;

	let isLoading = false;

	const close = getClose();

	const closeModal = () => close('!');
	const deleteItem = async () => {
		console.log('itemitemitem', item);
		isLoading = true;
		let dsActions: [DsAction] = [{}];
		const res = await datastoreService.getActions(item.d_id);
		if (res) {
			dsActions = res;
		}
		const actionIdDelete = dsActions.find(
			(action) => action?.operation?.trim().toLowerCase() === 'delete'
		)?.action_id;
		if (actionIdDelete) {
			const deleteItemReq: DeleteItemReq = {
				a_id: actionIdDelete,
				use_display_id: true,
				delete_linked_items: true
			};
			await itemsService.deleteItem(item.p_id, item.d_id, item.i_id, deleteItemReq);
		}
		await fetchItems();
		closeModal();
		isLoading = false;
	};
</script>

{#if isLoading}
	<p>Being deleted...</p>
{:else}
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
{/if}
