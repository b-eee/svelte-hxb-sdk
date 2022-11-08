<script lang="ts">
	import Paragraph from '$lib/components/skeleton/Paragraph.svelte';
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
	import { CheckIcon, ChevronDownIcon, TrashIcon } from '@rgossiaux/svelte-heroicons/outline';
	import { onMount } from 'svelte';
	import { getClose } from 'svelte-dialogs';
	import { datastoreService, itemsService, storageService } from '../+page';

	export let isUpdateOpen: boolean;
	export let itemFields: any = {};
	export let curUser: any = {};
	export let item: any = {};
	export let title = '';
	export let curItemDetail: any = {};
	export let getItemDetailParams: any = {};

	let userOption = [curUser];
	let selectedStatus: any = {};
	let updateItemData: any = [];
	let statusOption: any;
	let isLoading = false;
	console.log('curItemDetail', curItemDetail);
	// console.log('itemFields', itemFields);
	// console.log('item', item);
	// console.log('fieldTitle', title);

	const handleSelectStatus = (fieldId: string, e: any) => {
		selectedStatus = statusOption.find((stt: any) => stt.status_id === e.detail);
		updateItemData[fieldId] = e.detail;
	};
	const handleSelectUser = (field: any, e: any) => {
		updateItemData[field.id] = e.detail;
	};

	const getStatuses = async () => {
		statusOption = await datastoreService.getStatuses(item.d_id);
		console.log('statusOption', statusOption);
		selectedStatus = statusOption[0];
	};

	const getUpdateItemChangesMiddle = (field: any, e: any) => {
		getUpdateItemChanges(field, e.target.value);
	};

	const handleUploadFile = async (e: any) => {
		isLoading = true;
		const field = itemFields.find((i: any) => i.data_type === 'file');
		const file = e.target.files[0];
		const filename = file.name;
		const extension = file.type;
		const toBase64File = await toBase64(file);
		const payload = {
			filename,
			contentTypeFile: extension,
			filepath: `${item.d_id}/${item.i_id}/${field.id}/${filename}`,
			content: toBase64File,
			d_id: item.d_id,
			p_id: item.p_id,
			field_id: field.id,
			item_id: item.i_id,
			display_order: 0
		} as ItemFileAttachmentPl;
		const createFileRes = await storageService.createFile(payload);
		const newFileId = createFileRes.file_id;
		await getUpdateItemChanges(field, newFileId);
		await updateItem()
		isLoading = false;
	};

	const getUpdateItemChanges = async (field: any, value: any, deletedFiled?: string) => {
		isLoading = true;
		const keyArr = Object.keys(curItemDetail);
		const keyFile = keyArr.find((keyF) => curItemDetail[keyF].dataType === 'file') as string;
		const objectHasFile = curItemDetail[keyFile];
		console.log('objectHasFile', objectHasFile);
		let fileIds = [] as any;
		if (Array.isArray(objectHasFile.value)) {
			fileIds = [...objectHasFile.value.map((i: any) => i.file_id)] || [];
			console.log('fileIdsfileIds', fileIds);
		}

		const layoutSettings = await datastoreService.getDetail(item.d_id);
		const layoutFieldId = layoutSettings.field_layout.find((f: any) => f.id === field.id);
		const fieldId = layoutSettings.fields.find((f: any) => f.id === field.id);

		if (deletedFiled) {
			console.log("fileIdsfileIdsfileIdsfileIds", fileIds)
			fileIds = fileIds.filter((f: any) => f !== deletedFiled);
			console.log("fileIdsfileIdsfileIdsfileIds after filter", fileIds)
		}

		const idx = field.field_index;
		const tabindex = (layoutFieldId.row + 1) * 10 + layoutFieldId.col;
		let objectChange = {};
		if (field.data_type === 'file') {
			objectChange = {
				as_title: fieldId?.as_title,
				cols: layoutFieldId.size_x,
				dataType: 'file',
				id: field.id,
				idx,
				rowHeight: 'item.rowHeight',
				rows: layoutFieldId.size_y,
				status: fieldId.status,
				tabindex,
				title: title,
				unique: fieldId?.unique,
				x: layoutFieldId.col,
				y: layoutFieldId.row,
				post_file_ids: value ? [...fileIds, value] : [...fileIds],
				value: value ? [...fileIds, value] : [...fileIds]
			};
		} else {
			objectChange = {
				as_title: fieldId?.as_title,
				cols: layoutFieldId.size_x,
				dataType: fieldId.data_type,
				id: field.id,
				idx,
				rowHeight: 'item.rowHeight',
				rows: layoutFieldId.size_y,
				status: fieldId.status,
				tabindex,
				title: title,
				unique: fieldId?.unique,
				value,
				x: layoutFieldId.col,
				y: layoutFieldId.row
			};
		}
		updateItemData.push(objectChange);
		console.log('updateItemData', updateItemData);
		isLoading = false;
	};

	const close = getClose();
	const closeModal = () => close('!');

	const updateItem = async () => {
		isLoading = true;
		const dsActions: DsAction[] = await datastoreService.getActions(item.d_id);
		const updateId = dsActions.find(
			(action) => action?.operation?.trim().toLowerCase() === 'update'
		)?.action_id;

		const itemActionParameters = {
			changes: updateItemData,
			action_id: updateId,
			history: {
				comment: '',
				datastore_id: item.d_id,
				action_id: updateId
			},
			rev_no: Number(item.rev_no)
		};

		try {
			const data = await itemsService.updateItem(
				item.p_id,
				item.d_id,
				item.i_id,
				itemActionParameters
			);

			item.rev_no = data.rev_no.rev_no
		} catch (error) {
			console.log(error);
		} finally {
			isLoading = false;
			closeModal();
		}
	};

	const deleteFile = async (file: any) => {
		isLoading = true;
		const field = itemFields.find((i: any) => i.data_type === 'file');
		const fileId = file.file_id;
		console.log('fileId when delete', fileId);
		try {
			await storageService.deleteFile(fileId);
			await getUpdateItemChanges(field, '', file.file_id);
		} catch (error) {
			console.log(error);
		} finally {
			await updateItem();
			isLoading = false;
		}
	};

	onMount(async () => {
		getStatuses();
	});
</script>

{#if isLoading}
	<p>Processing...</p>
{:else}
	<div class="flex flex-col gap-4">
		<div class="text-lg font-bold text-center" id="dialog-title-id">Update Item</div>
		<div class="text-center text-red-400 text-sm italic font-light">
			You should choose an item first
		</div>
		<div class="w-full">
			<div class="content flex flex-col gap-4">
				<form>
					{#each itemFields as field (field.id)}
						<div>
							{#if field.data_type === 'text'}
								<div class="my-3 flex gap-4 justify-between items-center">
									<label class="w-32 my-3 text-sm font-semibold" for={field.id}
										>{field.display_name}</label
									>
									<input
										id={field.id}
										value={item[field.id]}
										on:change={(e) => getUpdateItemChangesMiddle(field, e)}
										placeholder={`Please enter ${field.display_name}`}
										class="w-full rounded-md bg-slate-50 p-3"
									/>
								</div>
							{:else if field.data_type === 'status'}
								<div class="my-3 flex gap-4 justify-between items-center">
									<label class="w-24 my-3 text-sm font-semibold" for={field.id}>status</label>
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
											<span
												class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
											>
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
															<span
																class={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
															>
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
								<div class="my-3 flex gap-4 items-center justify-between">
									<label class="w-24 my-3 text-sm font-semibold" for={field.id}>users</label>
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
											<span
												class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
											>
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
												class="absolute z-30 right-8 left-8 mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
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
							{/if}
						</div>
					{/each}
					<div class="my-6 flex flex-col gap-4">
						{#each Object.keys(curItemDetail) as fieldKey (fieldKey)}
							{#if curItemDetail[fieldKey].dataType === 'file'}
								<input type="file" on:change={(e) => handleUploadFile(e)} />
								{#if curItemDetail[fieldKey].value}
									<div class="flex gap-3">
										{#if Array.isArray(curItemDetail[fieldKey].value)}
											{#each curItemDetail[fieldKey].value as file}
												<div class="flex">
													<button
														type="button"
														class="px-2 py-1.5 rounded-l-md bg-orange-200 max-w-32 overflow-ellipsis"
													>
														{file.filename}
													</button>
													<button
														class="px-3 border hover:bg-orange-200 rounded-r-md"
														on:click|stopPropagation={() => deleteFile(file)}
													>
														<TrashIcon class="h-5 w-5" aria-hidden="true" />
													</button>
												</div>
											{/each}
										{/if}
									</div>
								{/if}
							{/if}
						{/each}
					</div>
				</form>
			</div>
			<hr class="my-3" />
			<div class="w-full flex justify-between items-center">
				<button
					type="button"
					class="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-md text-sm px-6 py-2 text-center"
					on:click={updateItem}>Save</button
				>
				<button
					class="px-3 py-1 bg-slate-200 rounded-md"
					on:click={() => {
						isUpdateOpen = false;
					}}>Cancel</button
				>
			</div>
		</div>
	</div>
{/if}

<style scoped>
	:global(.dialog__container) {
		min-width: 640px;
	}
</style>
