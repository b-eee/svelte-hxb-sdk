<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Paragraph from '$lib/components/skeleton/Paragraph.svelte';
	import SelectIcon from '$lib/images/SelectIcon.svelte';
	import type { ItemFieldType } from '$lib/type/item';
	import type { ApplicationAndDataStore } from '@hexabase/hexabase-js/dist/lib/types/application/response';
	import type { GetItemDetailPl } from '@hexabase/hexabase-js/dist/lib/types/item';
	import {
		Listbox,
		ListboxButton,
		ListboxOptions,
		ListboxOption,
		Transition,
		ListboxLabel,
		Disclosure,
		DisclosureButton,
		DisclosurePanel,
		TabGroup,
		TabList,
		Tab,
		TabPanels,
		TabPanel
	} from '@rgossiaux/svelte-headlessui';
	import {
		CheckIcon,
		ArrowDownIcon,
		ChevronDownIcon,
		ChevronUpIcon
	} from '@rgossiaux/svelte-heroicons/outline';
	import { applicationService, datastoreService, itemsService } from './+page';

	const { ws_id } = $page.params;
	let loadingApp: boolean = false;
	let loadingItems: boolean = false;
	let appAndDsArray: [ApplicationAndDataStore] = [{}];
	let curProjectId = '';
	let currentApp: ApplicationAndDataStore = {};
	let curDatastoreId = '';
	let items: any = [];
	let fieldsLayout = [];
	let itemFields: ItemFieldType[] = [];
	let itemFieldsExceptFile: any = [];

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
		itemFieldsExceptFile = itemFields.filter((i) => i.data_type !== 'file');
		console.log('dsDetail', dsDetail);
	};

	$: curDatastoreId && getDsDetail();

	const getItemDetail = async (ds_id: string, item_id: string, project_id: string) => {
		const dsDetail = await itemsService.getItemDetail(
			ds_id,
			item_id,
			project_id,
			getItemDetailParams
		);
		itemFields = dsDetail.fields;
		itemFieldsExceptFile = itemFields.filter((i) => i.data_type !== 'file');
		console.log('itemFieldsExceptFile', itemFieldsExceptFile);
	};

	$: curDatastoreId && getDsDetail();

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
</script>

<div class="grid grid-cols-12 h-full gap-8 px-8 py-2">
	<div class="col-span-3 flex flex-col gap-8">
		<div class="projects w-72 h-fit-content">
			<p class="text-sm font-semibold p-2">Projects</p>
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
							class="bg-slate-100 cursor-pointer shadow-md rounded-md overflow-hidden"
						>
							<ListboxButton
								class="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm"
							>
								<span class="block truncate">{currentApp?.name}</span>
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
												<span class={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
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
		<div class="datastores h-1/2 w-64">
			<Disclosure let:open class="cursor-pointer shadow-md rounded-md overflow-hidden">
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

	<div class="col-span-9">
		<div class="grid grid-cols-12">
			<div class="col-span-9">
				<p class="text-sm font-semibold p-2">Datastore items</p>
				<table class="table-auto w-full">
					{#if items}
						<thead
							class="text-xs text-gray-700 uppercase bg-emerald-400 dark:bg-gray-700 dark:text-gray-400"
						>
							<tr>
								{#each itemFieldsExceptFile as itemFieldExceptFile}
									<th scope="col" class="py-3"> {itemFieldExceptFile.display_name} </th>
								{/each}
							</tr>
						</thead>
						<tbody class="bg-emerald-50 text-center">
							{#each items as item}
								<tr
									class="dark:bg-gray-800 dark:border-gray-700 text-left cursor-pointer hover:bg-amber-100"
									on:keydown={() => handleClickRow(item)}
									on:click={() => handleClickRow(item)}
								>
									{#each itemFieldsExceptFile as itemFieldExceptFile}
										<td class="p-2">
											{item[itemFieldExceptFile.id]}
										</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					{:else}
						<div class="w-full h-full bg-white">
							<Paragraph />
						</div>
					{/if}
				</table>
			</div>
			<div class="col-span-3 w-full max-w-md px-2 py-16 sm:px-0">
				Items detail
				<TabGroup>
					<TabList class="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
						<Tab let:selected class="px-3">
							<button
								class={`
              'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
			                ${
												selected
													? 'bg-white shadow'
													: 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
											}
						`}>Detail</button
							>
						</Tab>
						<Tab>Files</Tab>
					</TabList>
					<TabPanels>
						<TabPanel
							class="rounded-xl bg-white p-3
                ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
							>Content 1</TabPanel
						>
						<TabPanel>Content 2</TabPanel>
					</TabPanels>
				</TabGroup>
			</div>
		</div>
	</div>
</div>

<style>
</style>
