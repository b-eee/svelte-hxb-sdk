<script lang="ts">
	import { toBase64 } from '$lib/helper';
	import type { DsAction } from '@hexabase/hexabase-js/dist/lib/types/datastore';
	import type { ItemFileAttachmentPl } from '@hexabase/hexabase-js/dist/lib/types/storage';
	import {
		Listbox,
		ListboxButton,
		ListboxOption,
		ListboxOptions,
		Transition
	} from '@rgossiaux/svelte-headlessui';
	import { CheckIcon, ChevronDownIcon } from '@rgossiaux/svelte-heroicons/outline';
	import { onMount } from 'svelte';
	import { getClose } from 'svelte-dialogs';
	import { datastoreService, itemsService, storageService } from '../+page';

	export let curDatastoreId = '';
	export let curProjectId = '';
	export let fetchItems = () => {};
	export let curUser: any = {};

	let itemFields: any = {};
	let createItemParams: any = {};
	let itemLayout: any = [];

	let selectedStatus: any = {};
	let statusOption: any;

	const getDsDetail = async () => {
		const dsDetail = await datastoreService.getDetail(curDatastoreId);
		itemFields = dsDetail.fields;
		itemLayout = dsDetail.field_layout;
		console.log('dsDetail', dsDetail);
	};

	$: curDatastoreId && getDsDetail();

	const close = getClose();

	const closeModal = () => close('!');

	const createUploadFile = async (e: any, field: any) => {
		const file = e.target.files[0];
		const filename = file.name;
		const extension = file.type;
		const toBase64File = await toBase64(file);
		console.log('create file tobase64', toBase64File);
		const payload = {
			filename,
			contentTypeFile: extension,
			filepath: `${curDatastoreId}/${curProjectId}/${field.field_id}/${filename}`,
			content: toBase64File,
			d_id: curDatastoreId,
			p_id: curProjectId,
			field_id: field.field_id,
			item_id: createItemParams.item_id,
			display_order: 0
		} as ItemFileAttachmentPl;
		const createFileRes = await storageService.createFile(payload);
		createItemParams[field.field_id] = [
			...(createItemParams[field.field_id] || []),
			createFileRes.file_id
		];
	};

	const createItem = async () => {
		const dsActions: DsAction[] = await datastoreService.getActions(curDatastoreId);
		const actionIdCreate = dsActions.find(
			(action) => action?.operation?.trim().toLowerCase() === 'new'
		)?.action_id;

		const newItemPl = {
			action_id: actionIdCreate,
			use_display_id: true,
			return_item_result: true,
			ensure_transaction: false,
			exec_children_post_procs: true,
			access_key_updates: {
				overwrite: true,
				ignore_action_settings: true
			},
			item: createItemParams
		};
		console.log('newItemPl', newItemPl);
		const newItem = await itemsService.createItem(curProjectId, curDatastoreId, newItemPl);
		if (newItem) {
			fetchItems();
            closeModal()
		}
	};

	const handleSelectStatus = (fieldId: string, e: any) => {
		selectedStatus = statusOption.find((stt: any) => stt.status_id === e.detail);
		createItemParams[fieldId] = e.detail;
	};
	const handleSelectUser = (field: any, e: any) => {
		createItemParams[field.id] = [e.detail];
	};

	const getStatuses = async () => {
		statusOption = await datastoreService.getStatuses(curDatastoreId);
		console.log('statusOption', statusOption);
		selectedStatus = statusOption[0];
	};

	const handleTextFieldChange = (field: any, e: any) => {
		createItemParams[field.id] = e.target.value;
		console.log('createItemData after update', createItemParams);
	};

	onMount(async () => {
		createItemParams.item_id = await itemsService.createItemId(curDatastoreId);
		getStatuses();
	});
</script>

<div>
	<!-- <pre>{JSON.stringify(itemFields, null, 2)}</pre> -->
	<form class="flex flex-col w-full">
		{#if Array.isArray(itemFields)}
			{#each itemFields as field (field.id)}
				{#if field.data_type === 'file'}
					<div class="py-3 px-4 flex">
						<span class="mr-2 w-28 text-sm font-semibold">{field.display_name}</span>
						<input
							id={field.id}
							type="file"
							on:change={(e) => createUploadFile(e, field)}
							class="flex-1"
						/>
					</div>
				{:else if field.data_type === 'status'}
					<div class="-order-3 py-3 px-4 flex items-center">
						<div class="mr-2 w-28 text-sm font-semibold" for={field.id}>status</div>
						<Listbox
							value={selectedStatus}
							on:change={(e) => handleSelectStatus(field.id, e)}
							horizontal={false}
							class="bg-slate-50 cursor-pointer rounded-md overflow-hidden flex-1 z-20"
						>
							<ListboxButton
								class="relative w-full cursor-pointer bg-slate-50 py-2 pl-3 pr-10 text-left shadow-md focus:outline-nonefocus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300"
							>
								<span class="block truncate">{selectedStatus?.displayed_name}</span>
								<span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
									<ChevronDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
								</span>
							</ListboxButton>
							<Transition
								enter="transition duration-100 ease-out"
								enterFrom="transform scale-95 opacity-0"
								enterTo="transform scale-100 opacity-100"
								leave="transition duration-75 ease-out"
								leaveFrom="transform scale-100 opacity-100"
								leaveTo="transform scale-95 opacity-0"
							>
								<ListboxOptions
									class="absolute right-8 left-8 mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
								>
									{#each statusOption as stt (stt.status_id)}
										<ListboxOption
											value={stt.status_id}
											class={({ active }) =>
												`relative cursor-pointer select-none py-2 px-3 ${
													active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
												}`}
											let:selected
										>
											<div
												class={`${selected ? 'bg-amber-100 text-amber-900' : 'text-gray-900'},
                  'relative cursor-pointer select-none py-2 px-3`}
											>
												<span class={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
													{stt.displayed_name}
												</span>
												{#if selected}
													<span
														class="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600"
													>
														<CheckIcon class="h-5 w-5" aria-hidden="true" />
													</span>
												{/if}
											</div>
										</ListboxOption>
									{/each}
								</ListboxOptions>
							</Transition>
						</Listbox>
					</div>
				{:else if field.data_type === 'users'}
					<div class="flex items-center justify-between -order-2 px-4">
						<div class="mr-2 w-28 text-sm font-semibold" for={field.id}>users</div>
						<Listbox
							value={curUser}
							on:change={(e) => handleSelectUser(field, e)}
							horizontal={false}
							class="bg-slate-50 cursor-pointer rounded-md overflow-hidden flex-1"
						>
							<ListboxButton
								class="relative w-full cursor-pointer bg-slate-50 py-2 pl-3 pr-10 text-left shadow-md focus:outline-nonefocus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300"
							>
								<span class="block truncate">current user</span>
								<span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
									<ChevronDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
								</span>
							</ListboxButton>
							<Transition
								enter="transition duration-100 ease-out"
								enterFrom="transform scale-95 opacity-0"
								enterTo="transform scale-100 opacity-100"
								leave="transition duration-75 ease-out"
								leaveFrom="transform scale-100 opacity-100"
								leaveTo="transform scale-95 opacity-0"
							>
								<ListboxOptions
									class="absolute z-10 right-8 left-8 mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
								>
									<ListboxOption value={curUser.id}>
										<div class={'relative cursor-pointer select-none py-2 px-3'}>
											<span> current user </span>
										</div>
									</ListboxOption>
								</ListboxOptions>
							</Transition>
						</Listbox>
					</div>
				{:else}
					<div class="my-1 px-4 items-center -order-1 flex">
						<span class="mr-2 w-28 text-sm font-semibold">{field.display_name}</span>
						<input
							required
							id={field.id}
							type="text"
							placeholder={`Please enter the ${field.display_name}`}
							class="border rounded-sm p-3 flex-1"
							on:change={(e) => handleTextFieldChange(field, e)}
						/>
					</div>
				{/if}
			{/each}
		{/if}
	</form>
	<div class="flex mt-4 justify-between">
		<button
			class="bg-orange-200 rounded-md hover:bg-orange-400 ease-out duration-300 px-4 py-2"
			on:click={createItem}>Create</button
		>
		<button
			class="bg-orange-200 rounded-md hover:bg-orange-400 ease-out duration-300 px-4 py-2"
			on:click={closeModal}>Cancel</button
		>
	</div>
</div>
