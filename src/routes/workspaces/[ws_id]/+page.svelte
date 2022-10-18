<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Datastore from '@hexabase/hexabase-js/dist/lib/packages/datastore';
	import type { ApplicationAndDataStore } from '@hexabase/hexabase-js/dist/lib/types/application/response';
	import {
		Listbox,
		ListboxButton,
		ListboxOptions,
		ListboxOption,
		Transition,
		ListboxLabel,
		Disclosure,
		DisclosureButton,
		DisclosurePanel
	} from '@rgossiaux/svelte-headlessui';
	import { CheckIcon, ArrowDownIcon } from '@rgossiaux/svelte-heroicons/outline';
	import { applicationService } from './+page';
	const people = [
		{ id: 1, name: 'Durward Reynolds', unavailable: false },
		{ id: 2, name: 'Kenton Towne', unavailable: false },
		{ id: 3, name: 'Therese Wunsch', unavailable: false },
		{ id: 4, name: 'Benedict Kessler', unavailable: true },
		{ id: 5, name: 'Katelyn Rohan', unavailable: false }
	];
	const ds = [
		{ id: 1, name: 'Durward Reynolds', unavailable: false },
		{ id: 2, name: 'Kenton Towne', unavailable: false },
		{ id: 3, name: 'Therese Wunsch', unavailable: false },
		{ id: 4, name: 'Benedict Kessler', unavailable: true },
		{ id: 5, name: 'Katelyn Rohan', unavailable: false }
	];

	const { ws_id } = $page.params;
	let curApplicationId = '';
	let appAndDsArray: [ApplicationAndDataStore] = [{}];
	const fetchData = (async () => {
		const appAndDs: [ApplicationAndDataStore] = await applicationService.getAppAndDs(ws_id);
		appAndDsArray = appAndDs;
		return appAndDs;
	})();
	let currentApp: ApplicationAndDataStore | undefined = appAndDsArray.find(
		(i) => i.application_id === curApplicationId
	);

	const handleSelectApp = (e: CustomEvent<any>) => {
		curApplicationId = e.detail;
		$page.url.searchParams.set('application', e.detail);
		console.log('$page$page', $page);
		goto($page.url.href);
	};
</script>

<div class="grid grid-cols-12 h-full ">
	<div class="col-span-3 px-8 py-2 flex flex-col gap-8">
		<div class="projects w-64 h-96">
			<p class="text-sm font-semibold p-2">Projects</p>
			{#await fetchData}
				<p>...loading</p>
			{:then appAndDs}
				{#if appAndDs !== undefined}
					<Listbox
						on:change={(e) => handleSelectApp(e)}
						horizontal={false}
						class="bg-slate-100 cursor-pointer shadow-md rounded-md overflow-hidden"
					>
						<ListboxButton
							class="cursor-pointer flex items-center justify-between w-full text-left bg-slate-50 px-3 py-2"
						>
							<p>{currentApp?.name}</p>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width={1.5}
								stroke="currentColor"
								class="w-4 h-4"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
								/>
							</svg>
						</ListboxButton>
						<Transition
							enter="transition duration-100 ease-out"
							enterFrom="transform scale-95 opacity-0"
							enterTo="transform scale-100 opacity-100"
							leave="transition duration-75 ease-out"
							leaveFrom="transform scale-100 opacity-100"
							leaveTo="transform scale-95 opacity-0"
						>
							<ListboxOptions class="h-64 overflow-y-scroll">
								{#each appAndDs as project (project.application_id)}
									<ListboxOption
										value={project.application_id}
										class={({ active }) => (active ? 'active' : '')}
										let:selected
									>
										{#if selected}
											<div
												class="w-full flex items-center px-3 py-2 hover:bg-orange-200 ease-in-out duration-300"
											>
												<CheckIcon class="h-8 w-8 text-orange-400 pr-2 font-semibold" />
												<p class="flex-grow-1 font-semibold">
													{project.name}
												</p>
											</div>
										{:else}
											<div
												class="w-full flex items-center px-3 py-2 hover:bg-orange-200 ease-in-out duration-300"
											>
												<div class="h-8 w-8" />
												<p class="flex-grow-1">
													{project.name}
												</p>
											</div>
										{/if}
									</ListboxOption>
								{/each}
							</ListboxOptions>
						</Transition>
					</Listbox>
				{/if}
			{:catch error}
				<p style="color: red">{error.message}</p>
			{/await}
		</div>
		<div class="datastores h-1/2 w-64">
			<!-- <p class="text-sm font-semibold p-2">Datastore</p> -->
			<Disclosure class="bg-slate-100 cursor-pointer shadow-md rounded-md overflow-hidden">
				<DisclosureButton
					class="w-full flex justify-between items-center bg-slate-50 cursor-pointer px-3 py-2"
				>
					<p>Datastores</p>
					<ArrowDownIcon class="h-4 w-4 text-purple" />
				</DisclosureButton>
				<DisclosurePanel>
					{#if currentApp?.datastores}
						{#each currentApp.datastores as datastore (datastore.datastore_id)}
							<div
								class="px-3 py-2 bg-slate-100 cursor-pointer hover:bg-orange-200 ease-in-out duration-300"
							>
								{datastore.name}
							</div>
						{/each}
					{:else}
						<p
							class="px-3 py-2 bg-slate-100 cursor-pointer hover:bg-orange-200 ease-in-out duration-300"
						>
							Error roi, F5 thoi
						</p>
					{/if}
				</DisclosurePanel>
			</Disclosure>
		</div>
	</div>
	<div class="col-span-10 grid grid-cols-12">
		<div class="col-span-10" />
		<div class="col-span-2" />
	</div>
</div>

<style>
</style>
