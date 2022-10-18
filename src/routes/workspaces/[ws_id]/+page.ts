import { createClient, HexabaseClient } from '@hexabase/hexabase-js';
import type { ApplicationAndDataStore } from '@hexabase/hexabase-js/dist/lib/types/application/response';
export const applicationService = {
	getAppAndDs,
	createApp,
	getApplication
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
