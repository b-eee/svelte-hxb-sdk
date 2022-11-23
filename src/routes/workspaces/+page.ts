import { createClient, HexabaseClient } from '@hexabase/hexabase-js';
export const workspaceService = {
	getWorkspaces
};

const url = import.meta.env.VITE_URL;

async function initHxbClient() {
	const token = JSON.parse(localStorage.getItem('user')!).token;
	const hexabase: HexabaseClient = token && (await createClient({ url, token }));
	return hexabase;
}

// get all workspaces
async function getWorkspaces() {
	const hexabase = await initHxbClient();
	console.log(hexabase);
	console.log(hexabase);
	const { workspaces, error } = await hexabase.workspace.get();
	return workspaces;
}
