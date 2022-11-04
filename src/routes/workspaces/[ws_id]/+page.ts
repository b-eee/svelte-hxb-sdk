import { createClient, HexabaseClient } from '@hexabase/hexabase-js';
import type { ApplicationAndDataStore } from '@hexabase/hexabase-js/dist/lib/types/application/response';
import type {
	CreateNewItemPl,
	DeleteItemReq,
	GetHistoryPl,
	GetItemDetailPl,
	GetItemsPl,
	ItemActionParameters
} from '@hexabase/hexabase-js/dist/lib/types/item';
import type { ItemFileAttachmentPl } from '@hexabase/hexabase-js/dist/lib/types/storage';
export const applicationService = {
	getAppAndDs,
	createApp,
	getApplication
};

export const datastoreService = {
	getFields,
	getField,
	getActions,
	getDetail,
	getStatuses
};

export const itemsService = {
	getItems,
	getItemDetail,
	deleteItem,
	updateItem
};

export const storageService = {
	getFile,
	createFile,
	deleteFile
};

const url = import.meta.env.VITE_URL;

async function initHxbClient() {
	const token = JSON.parse(localStorage.getItem('user')!).token;
	const hexabase = token && (await createClient({ url, token }));
	return hexabase;
}

//get projects and datastores
async function getAppAndDs(id: string) {
	const hexabase = await initHxbClient();
	const { appAndDs, error } = await hexabase.applications.getProjectsAndDatastores(id);
	if (appAndDs !== undefined) {
		return appAndDs;
	}
}

//create project
async function createApp(createProjectParams: any) {
	const hexabase = await initHxbClient();
	const { app, error } = await hexabase.applications.create(createProjectParams);
	return app?.project_id;
}

// get application
async function getApplication(projectId: string) {
	const hexabase = await initHxbClient();
	const { project, error } = await hexabase.applications.get(projectId);
	return project;
}

async function getFields(datastoreId: string, projectId: string) {
	const hexabase = await initHxbClient();
	const { dsFields, error } = await hexabase.datastores.getFields(datastoreId, projectId);
	return dsFields;
}

async function getDetail(datastoreId: string) {
	const hexabase = await initHxbClient();
	const { datastoreSetting, error } = await hexabase.datastores.getDetail(datastoreId);
	return datastoreSetting;
}

async function getField(fieldId: string, datastoreId: string) {
	const hexabase = await initHxbClient();
	const { dsField, error } = await hexabase.datastores.getField(fieldId, datastoreId);
	return dsField;
}

async function getActions(datastoreId: string) {
	const hexabase = await initHxbClient();
	const { dsActions, error } = await hexabase.datastores.getActions(datastoreId);
	return dsActions;
}

async function getStatuses(datastoreId: string) {
	const hexabase = await initHxbClient();
	const { dsStatuses, error } = await hexabase.datastores.getStatuses(datastoreId);
	return dsStatuses;
}

//get datastore_item
async function getItems(projectId: string, datastoreId: string, getItemsParameters: GetItemsPl) {
	const hexabase = await initHxbClient();
	const { dsItems, error } = await hexabase.items.get(getItemsParameters, datastoreId, projectId);
	return dsItems;
}

// get detail datastore_item
async function getItemDetail(
	datastoreId: string,
	itemId: string,
	projectId: string,
	itemDetailParams: GetItemDetailPl
) {
	const hexabase = await initHxbClient();
	const { itemDetails, error } = await hexabase.items.getItemDetail(
		datastoreId,
		itemId,
		projectId,
		itemDetailParams
	);
	return itemDetails;
}

// get histories
async function getHistories(
	projectId: string,
	datastoreId: string,
	historyParams: GetHistoryPl,
	itemId: string
) {
	const hexabase = await initHxbClient();
	const { itemHistories, error } = await hexabase.items.getHistories(
		projectId,
		datastoreId,
		itemId,
		historyParams
	);
	return itemHistories;
}

//create datastore_item id
async function createItemId(datastoreId: string) {
	const hexabase = await initHxbClient();
	const { item_id, error } = await hexabase.items.createItemId(datastoreId);
	return item_id;
}

//create datastore_item
async function createItem(projectId: string, datastoreId: string, newItemPl: CreateNewItemPl) {
	const hexabase = await initHxbClient();
	const { itemNew, error } = await hexabase.items.create(projectId, datastoreId, newItemPl);
	return itemNew;
}

//get datastore_item related
async function getItemRelated(datastoreId: string, itemId: string, linkedDatastoreId: string) {
	const hexabase = await initHxbClient();
	const { itemLinked, error } = await hexabase.items.getItemRelated(
		datastoreId,
		itemId,
		linkedDatastoreId
	);
	return itemLinked;
}

//delete datastore_item
async function deleteItem(
	projectId: string,
	datastoreId: string,
	itemId: string,
	deleteItemReq: DeleteItemReq
) {
	const hexabase = await initHxbClient();
	const { data, error } = await hexabase.items.delete(
		projectId,
		datastoreId,
		itemId,
		deleteItemReq
	);
	return data;
}

//update datastore_item
async function updateItem(
	projectId: string,
	datastoreId: string,
	itemId: string,
	itemActionParameters: ItemActionParameters
) {
	const hexabase = await initHxbClient();
	const { data, error } = await hexabase.items.update(
		projectId,
		datastoreId,
		itemId,
		itemActionParameters
	);
	return data;
}

async function getFile(getDownloadFileId: string) {
	const hexabase = await initHxbClient();
	const { file, error } = await hexabase.storage?.getFile(getDownloadFileId);
	return file;
}

async function createFile(payload: ItemFileAttachmentPl) {
	const hexabase = await initHxbClient();
	const { data, error } = await hexabase.storage.createFile(payload);
	return data;
}

async function deleteFile(fileId: string) {
	const hexabase = await initHxbClient();
	const { data, error } = await hexabase.storage.delete({ fileId });
	return data;
}
