<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import List from '$lib/components/skeleton/List.svelte';
	import Paragraph from '$lib/components/skeleton/Paragraph.svelte';
	import { clx } from '$lib/helper';
	import type { ItemFieldType } from '$lib/type/item';
	import type { ApplicationAndDataStore } from '@hexabase/hexabase-js/dist/lib/types/application/response';
	import type { GetItemDetailPl } from '@hexabase/hexabase-js/dist/lib/types/item';
	import {
		Disclosure,
		DisclosureButton,
		DisclosurePanel,
		Listbox,
		ListboxButton,
		ListboxOption,
		ListboxOptions,
		Tab,
		TabGroup,
		TabList,
		TabPanel,
		TabPanels,
		Transition
	} from '@rgossiaux/svelte-headlessui';
	import {
		CheckIcon,
		ChevronDownIcon,
		ChevronUpIcon,
		PencilAltIcon,
		TrashIcon
	} from '@rgossiaux/svelte-heroicons/outline';
	import PlusCircle from '@rgossiaux/svelte-heroicons/outline/PlusCircle';
	import { onMount } from 'svelte';
	import { dialogs } from 'svelte-dialogs';
	import { applicationService, datastoreService, itemsService, storageService } from './+page';
	import CreateItem from './modal/CreateItem.svelte';
	import CreateProject from './modal/CreateProject.svelte';
	import DeleteItem from './modal/DeleteItem.svelte';
	import EditItem from './modal/EditItem.svelte';

	const { ws_id } = $page.params;
	let loadingApp: boolean = false;
	let loadingItems: boolean = false;
	let appAndDsArray: [ApplicationAndDataStore] = [{}];
	let curProjectId = '';
	let currentApp: ApplicationAndDataStore = {};
	let curDatastoreId = '';
	let items: any = [];
	let itemFields: ItemFieldType[] = [];
	let curLayout: any = [];

	let curUser: any = {};
	let itemFieldsExceptFile: any = [];
	let curItemDetail = [] as any;
	let itemDetailLoading = false;
	let statusOption = [] as any;
	let tableLoading = false;
	let isDeleteOpen = false;
	let isUpdateOpen = false;
	let fieldTitle = '';
	let templates: any = {};
	let getItemsParameters = {
		use_or_condition: false,
		sort_field_id: '',
		page: 1,
		per_page: 20
	};

	let getItemDetailParams: GetItemDetailPl = {
		include_lookups: true,
		use_display_id: true,
		return_number_value: true,
		format: '',
		include_linked_items: true
	};

	// const getStatuses = async () => {
	// 	statusOption = await datastoreService.getStatuses(curDatastoreId);
	// 	console.log('statusOption', statusOption);
	// };

	// $: curDatastoreId && getStatuses();

	// const getStatusNameById = (displayName: string) => {
	// 	const name = statusOption.find((opt: any) => opt.status_id === displayName).displayed_name;
	// 	console.log('displayName', displayName);
	// 	console.log('name', name);
	// 	return name;
	// };

	const fetchAppAndDs = (async () => {
		loadingApp = true;
		const appAndDs: [ApplicationAndDataStore] = await applicationService.getAppAndDs(ws_id);
		appAndDsArray = appAndDs;
		currentApp = appAndDs[0];
		curProjectId = currentApp.application_id!;
		loadingApp = false;
		return appAndDs;
	})();

	const fetchItems = async () => {
		loadingItems = true;
		const res = await itemsService.getItems(curProjectId, curDatastoreId, getItemsParameters);
		items = res.items;
		loadingItems = false;
		console.log('resresresresresres', res);
		return res;
	};

	$: curDatastoreId && fetchItems();

	const getDsDetail = async () => {
		const dsDetail = await datastoreService.getDetail(curDatastoreId);
		itemFields = dsDetail.fields;
		const curLayout = dsDetail.field_layout;
		curUser = curLayout.find((u: any) => u.display_id === 'user_id');
		curUser['user_name'] = 'current user';
		itemFieldsExceptFile = itemFields.filter((i) => i.data_type !== 'file');
		console.log('dsDetail', dsDetail);
	};

	$: curDatastoreId && getDsDetail();

	const getItemDetail = async (ds_id: string, item_id: string, project_id: string) => {
		itemDetailLoading = true;
		const res = await itemsService.getItemDetail(ds_id, item_id, project_id, getItemDetailParams);
		curLayout = res.field_layout;
		curItemDetail = res.field_values;
		fieldTitle = res.title;
		statusOption = res.status_list;
		itemDetailLoading = false;
	};

	const handleSelectApp = (e: CustomEvent<any>) => {
		console.log(e.detail);
		curProjectId = e.detail;
		const res = appAndDsArray.find((i) => i.application_id === curProjectId);
		if (res) {
			currentApp = res;
		}
		$page.url.searchParams.set('application', e.detail);
		console.log(currentApp);
		goto($page.url.href);
	};

	const handleSelectDs = (dsId: any) => {
		console.log(dsId);
		curDatastoreId = dsId;
	};

	const handleClickRow = async (field: any) => {
		console.log('field', field);
		await getItemDetail(field.d_id, field.i_id, field.p_id);
	};

	const handleDeleteItem = async (item: any) => {
		await dialogs.modal(DeleteItem, {
			isDeleteOpen: isDeleteOpen,
			fetchItems: fetchItems,
			item: item
		});
	};

	const downloadFile = async (file: any) => {
		const res = await storageService.getFile(file.file_id);
		if (res.data) {
			let a = document.createElement('a');
			const realData = res.data.split('/').slice(2).join('/');
			a.href = `data:${file.contentType};base64,/${realData}`;
			a.download = res.filename;
			a.click();
		}
	};

	const handleEditItem = async (item: any) => {
		await getItemDetail(item.d_id, item.i_id, item.p_id);
		await dialogs.modal(EditItem, {
			isUpdateOpen: isUpdateOpen,
			itemFields: itemFields,
			statusOption: statusOption,
			curUser: curUser,
			item: item,
			curItemDetail: curItemDetail,
			title: fieldTitle
		});
	};

	const handleCreateItem = async () => {
		await dialogs.modal(CreateItem, {
			curDatastoreId: curDatastoreId,
			curProjectId: curProjectId,
			fetchItems: fetchItems,
			curUser: curUser
		});
	};

	const handleCreateProject = async () => {
		await dialogs.modal(CreateProject, {
			categories: templates.categories,
			fetchAppAndDs: fetchAppAndDs
		});
	};

	onMount(async () => {
		templates = await applicationService.getTemplates();
	});
</script>

<div class="h-full gap-4 px-8 py-2 flex">
	<div class="w-fit">
		<div class="px-5 py-4 border-b border-gray-100 flex justify-between">
			<div class="font-semibold text-gray-800">Projects</div>
			<button class="px-2" on:click={handleCreateProject}>
				<PlusCircle class="w-5 h-5" />
			</button>
		</div>
		<div class="shadow-md flex flex-col gap-8">
			<div class="projects h-1/2">
				{#await fetchAppAndDs}
					<div class="w-full h-full bg-white">
						<Paragraph />
					</div>
				{:then appAndDs}
					{#if appAndDs}
						<div class="w-72">
							<Listbox
								value={currentApp}
								on:change={(e) => handleSelectApp(e)}
								horizontal={false}
								class="bg-slate-100 cursor-pointer rounded-md overflow-hidden"
							>
								<ListboxButton
									class="relative w-full cursor-pointer bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm"
								>
									<span class="block truncate">{currentApp?.name}</span>
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
										class="mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
									>
										{#each appAndDs as project (project.application_id)}
											<ListboxOption
												value={project.application_id}
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
														{project.name}
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
					{/if}
				{:catch error}
					<p style="color: red">{error.message}</p>
				{/await}
			</div>
			<div class="datastores h-1/2">
				<Disclosure let:open class="cursor-pointer overflow-hidden">
					<DisclosureButton
						class="flex w-full justify-between rounded-lg bg-white px-4 py-2 text-left text-sm font-medium hover:slate-100 focus:outline-none focus-visible:ring focus-visible:ring-slate-500 focus-visible:ring-opacity-75"
					>
						<p>Datastores</p>
						<ChevronUpIcon class={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-slate-500`} />
					</DisclosureButton>
					<DisclosurePanel class="px-4 pt-4 pb-2 text-sm text-gray-500">
						{#if currentApp?.datastores}
							{#each currentApp.datastores as datastore (datastore.datastore_id)}
								<button
									on:click={() => handleSelectDs(datastore.datastore_id)}
									class="w-full text-left px-3 py-2 cursor-pointer hover:bg-orange-50 ease-in-out duration-300"
								>
									{datastore.name}
								</button>
							{/each}
						{:else}
							<p class="px-3 py-2 cursor-pointer hover:bg-orange-50 ease-in-out duration-300">
								Error
							</p>
						{/if}
					</DisclosurePanel>
				</Disclosure>
			</div>
		</div>
	</div>

	<div class="mx-3 flex-1">
		{#if loadingItems}
			<Paragraph />
		{:else}
			<div class="grid grid-cols-12 gap-4">
				<div class="col-span-9">
					<div class="px-5 py-4 border-b border-gray-100 flex justify-between">
						<div class="font-semibold text-gray-800">Datastore items</div>
						<button class="bg-orange-200 rounded-md px-4 py-1.5" on:click={handleCreateItem}
							>Create Item</button
						>
					</div>
					<div class="shadow-md px-6 py-3">
						{#if tableLoading}
							<Paragraph />
						{:else}
							<table class="table-auto w-full bg-white rounded-sm">
								{#if items}
									<thead
										class="text-left text-sm font-semibold uppercase text-gray-400 dark:text-white bg-gray-50 dark:bg-emerald-600"
									>
										<tr>
											{#if Array.isArray(itemFieldsExceptFile)}
												{#each itemFieldsExceptFile as itemFieldExceptFile}
													<th scope="col" class="py-3 px-"> {itemFieldExceptFile.display_name} </th>
												{/each}
											{:else}
												<p>Data not available</p>
											{/if}
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										{#if Array.isArray(items)}
											{#each items as item}
												<tr
													class="border-t-0 px-6 align-middle text-xs whitespace-nowrap p-4 text-blueGray-700 dark:bg-gray-800 dark:border-gray-700 text-left cursor-pointer hover:bg-amber-100"
													on:keydown={() => handleClickRow(item)}
													on:click={() => handleClickRow(item)}
												>
													{#each itemFieldsExceptFile as itemFieldExceptFile}
														<td class="px-2 py-4 border-b-stone-500 text-sm">
															{item[itemFieldExceptFile.id]}
														</td>
													{/each}
													<td>
														<button
															on:click|stopPropagation={() => handleDeleteItem(item)}
															type="button"
															class="bg-slate-200 rounded-lg text-sm px-2 py-1 text-center"
														>
															<TrashIcon class="h-5 w-5 text-red-400" />
														</button>
														<button
															on:click|stopPropagation={() => handleEditItem(item)}
															type="button"
															class="bg-slate-200 rounded-lg text-sm px-2 py-1 text-center"
														>
															<PencilAltIcon class="h-5 w-5 text-emerald-500" />
														</button>
													</td>
												</tr>
											{/each}
										{/if}
									</tbody>
								{:else}
									<div class="w-full h-full bg-white">
										<Paragraph />
									</div>
								{/if}
							</table>
						{/if}
					</div>
				</div>
				<div class="col-span-3 w-full max-w-md px-2 sm:px-0 ">
					<div class="px-5 py-4 border-b border-gray-100">
						<div class="font-semibold text-gray-800">Item detail</div>
					</div>
					<div class="shadow-md h-full">
						<TabGroup>
							<TabList class="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
								<Tab
									class={({ selected }) =>
										clx(
											'w-full rounded-lg py-1 text-sm font-medium leading-5 text-slate-800',
											'ring-white focus:outline-none focus:ring-2',
											selected
												? 'bg-white shadow'
												: 'text-slate-700 hover:bg-white/[0.12] hover:text-black'
										)}
									>Detail
								</Tab>
								<Tab
									class={({ selected }) =>
										clx(
											'w-full rounded-lg py-1 text-sm font-medium leading-5 text-slate-800',
											'ring-white focus:outline-none focus:ring-2',
											selected
												? 'bg-white shadow'
												: 'text-slate-700 hover:bg-white/[0.12] hover:text-black'
										)}>Files</Tab
								>
							</TabList>
							<TabPanels>
								<TabPanel
									class="{clx(
										'rounded-xl bg-white p-3',
										'ring-white focus:outline-none focus:ring-2'
									)}}"
								>
									{#if itemDetailLoading}
										<List />
									{:else}
										<ul>
											{#each Object.keys(curItemDetail) as i (i)}
												{#if ['users', 'file', 'status'].includes(curItemDetail[i].dataType) === false}
													<li class="px-3 py-2 bg-slate-100">{curItemDetail[i].field_name}</li>
													<li class="px-3 py-2">{curItemDetail[i].value}</li>
												{:else if curItemDetail[i].dataType === 'status'}
													<li class="px-3 py-2 bg-slate-100">staus</li>
													<li class="px-3 py-2">
														{statusOption[curItemDetail[i].value].status_name}
													</li>
												{:else if curItemDetail[i].dataType === 'user'}
													<li class="px-3 py-2 bg-slate-100">Users</li>
													{#if Array.isArray(curItemDetail[i].value)}
														{#each curItemDetail[i].value as userVal (userVal.user_id)}
															<li class="px-3 py-2">{userVal.user_name}</li>
														{/each}
													{/if}
												{/if}
											{/each}
										</ul>
									{/if}
								</TabPanel>
								<TabPanel>
									{#if itemDetailLoading}
										<List />
									{:else}
										<ul class="my-3">
											{#if curItemDetail}
												{#each Object.keys(curItemDetail) as i (i)}
													{#if curItemDetail[i].dataType === 'file'}
														<div class="px-3">
															{#if Array.isArray(curItemDetail[i].value)}
																{#each curItemDetail[i].value as file}
																	{#if typeof file === 'object'}
																		<div class="flex gap-2 items-end">
																			<button
																				type="button"
																				class="text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 max-w-md h-14"
																				on:click={() => downloadFile(file)}
																			>
																				<p class="text-ellipsis overflow-hidden ... ">
																					{file.filename}
																				</p>
																			</button>
																			<div class="px-3 py-2 text-xs font-thin italic">
																				size: {file.size}B
																			</div>
																		</div>
																	{/if}
																{/each}
															{/if}
														</div>
													{/if}
												{/each}
											{/if}
										</ul>
									{/if}
								</TabPanel>
							</TabPanels>
						</TabGroup>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
</style>
