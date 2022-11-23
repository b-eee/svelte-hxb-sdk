import { createClient, HexabaseClient } from '@hexabase/hexabase-js';
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
	getApplication,
	getTemplates
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
	updateItem,
	createItem,
	createItemId
};

export const storageService = {
	getFile,
	createFile,
	deleteFile
};

const url = import.meta.env.VITE_URL;

async function initHxbClient() {
	const token = JSON.parse(localStorage.getItem('user')!).token;
	const hexabase: HexabaseClient = token && (await createClient({ url, token }));
	return hexabase;
}

//get projects and datastores
async function getAppAndDs(id: string) {
	const hexabase = await initHxbClient();
	const { appAndDs, error } = await hexabase.project.getProjectsAndDatastores(id);
	if (appAndDs !== undefined) {
		return appAndDs;
	}
}

//create project
async function createApp(createProjectParams: any) {
	const hexabase = await initHxbClient();
	const { app, error } = await hexabase.project.create(createProjectParams);
	return app?.project_id;
}

// get application
async function getApplication(projectId: string) {
	const hexabase = await initHxbClient();
	const { getApplications, error } = await hexabase.project.get(projectId);
	return getApplications;
}

//get create application templates
async function getTemplates() {
	const hexabase = await initHxbClient();
	const { getTemplates, error } = await hexabase.project.getTemplates();
	return getTemplates;
}

async function getFields(datastoreId: string, projectId: string) {
	const hexabase = await initHxbClient();
	const { dsFields, error } = await hexabase.datastore.getFields(datastoreId, projectId);
	return dsFields;
}

async function getDetail(datastoreId: string) {
	const hexabase = await initHxbClient();
	const { datastoreSetting, error } = await hexabase.datastore.getDetail(datastoreId);
	return datastoreSetting;
}

async function getField(fieldId: string, datastoreId: string) {
	const hexabase = await initHxbClient();
	const { dsField, error } = await hexabase.datastore.getField(fieldId, datastoreId);
	return dsField;
}

async function getActions(datastoreId: string) {
	const hexabase = await initHxbClient();
	const { dsActions, error } = await hexabase.datastore.getActions(datastoreId);
	return dsActions;
}

async function getStatuses(datastoreId: string) {
	const hexabase = await initHxbClient();
	const { dsStatuses, error } = await hexabase.datastore.getStatuses(datastoreId);
	return dsStatuses;
}

//get datastore_item
async function getItems(projectId: string, datastoreId: string, getItemsParameters: GetItemsPl) {
	const hexabase = await initHxbClient();
	const { dsItems, error } = await hexabase.item.get(getItemsParameters, datastoreId, projectId);
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
	const { itemDetails, error } = await hexabase.item.getItemDetail(
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
	const { itemHistories, error } = await hexabase.item.getHistories(
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
	const { item_id, error } = await hexabase.item.createItemId(datastoreId);
	return item_id;
}

//create datastore_item
async function createItem(projectId: string, datastoreId: string, newItemPl: CreateNewItemPl) {
	const hexabase = await initHxbClient();
	const { itemNew, error } = await hexabase.item.create(projectId, datastoreId, newItemPl);
	return itemNew;
}

//get datastore_item related
async function getItemRelated(datastoreId: string, itemId: string, linkedDatastoreId: string) {
	const hexabase = await initHxbClient();
	const { itemLinked, error } = await hexabase.item.getItemRelated(
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
	const { data, error } = await hexabase.item.delete(projectId, datastoreId, itemId, deleteItemReq);
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
	const { data, error } = await hexabase.item.update(
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
	const { data, error } = await hexabase.storage.delete(fileId);
	return data;
}
