<script lang="ts">
	import { clx } from '$lib/helper';
	import type { CreateProjectPl } from '@hexabase/hexabase-js/dist/lib/types/application';
	import {
		RadioGroup,
		RadioGroupLabel,
		RadioGroupOption,
		Tab,
		TabGroup,
		TabList,
		TabPanel,
		TabPanels
	} from '@rgossiaux/svelte-headlessui';
	import { getClose } from 'svelte-dialogs';
	import { applicationService } from '../+page';
	export let categories: any = [];
	export let fetchAppAndDs = () => {};
	let curtemplateId = 'blank';
	let createProjectName = '';
	let isLoading = false;
	const handleChangeTemplate = (e: any) => {
		curtemplateId = e.detail;
		console.log('curtemplateId', curtemplateId);
	};

	const close = getClose();

	const closeModal = () => close('!');

	const createProject = async () => {
		isLoading = true;
		const createAppPl = {
			tp_id: curtemplateId === 'blank' ? '' : curtemplateId,
			name: {
				en: createProjectName,
				ja: createProjectName
			}
		} as CreateProjectPl;
		const app_id = await applicationService.createApp(createAppPl);
		fetchAppAndDs();
		isLoading = false;
		closeModal();
	};
</script>

<div class="flex flex-col gap-4">
	<div class="text-lg font-bold text-center" id="dialog-title-id">Create a new project</div>
	<form>
		<div class="flex gap-4 items-center">
			<div class="w-28">Project Name</div>
			<input
				bind:value={createProjectName}
				type="text"
				placeholder="Please enter new project name"
				class="w-full flex-1 px-4 py-2 border"
			/>
		</div>
		<RadioGroup value={curtemplateId} on:change={(e) => handleChangeTemplate(e)}>
			<RadioGroupOption value="blank" let:checked class="my-4">
				<span
					class="{checked ? 'bg-slate-200' : 'bg-merald-400'} rounded-md cursor-pointer px-3 py-1.5"
					>Blank</span
				>
				<div class="italic font-light text-sm py-3">A plain new project without any template</div>
			</RadioGroupOption>
			{#if Array.isArray(categories)}
				<div>
					<TabGroup>
						<TabList class="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
							{#each categories as category}
								<Tab
									class={({ selected }) =>
										clx(
											'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-slate-800',
											' focus:outline-none focus:ring-2',
											selected
												? 'bg-white shadow'
												: 'text-slate-700 hover:bg-white/[0.12] hover:text-black'
										)}>{category.category}</Tab
								>
							{/each}
						</TabList>
						<TabPanels class="mt-2">
							{#each categories as category}
								<TabPanel
									class="{clx('rounded-xl bg-white p-3', 'focus:outline-none focus:ring-2')}}"
								>
									{#each category.templates as template}
										<RadioGroupOption value={template.tp_id} let:checked>
											<span
												class="{checked
													? 'bg-slate-200'
													: 'bg-merald-400'} rounded-md cursor-pointer px-3 py-1.5"
												>{template.name}</span
											>
										</RadioGroupOption>
										<div class="italic font-light text-sm py-3">{template.description}</div>
									{/each}
								</TabPanel>
							{/each}
						</TabPanels>
					</TabGroup>
				</div>
			{/if}
		</RadioGroup>
	</form>
	<div class="mt-4 flex justify-between py-2 px-4">
		<button
			class="rounded-md bg-emerald-300 hover:bg-emerald-400 px-4 py-2"
			on:click={createProject}>Create</button
		>
		<button class="rounded-md bg-emerald-300 hover:bg-emerald-400 px-4 py-2" on:click={closeModal}
			>Cancel</button
		>
	</div>
</div>
