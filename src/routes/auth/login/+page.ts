import { createClient, HexabaseClient } from '@hexabase/hexabase-js';

const url = import.meta.env.VITE_URL;
async function login(email: string, password: string) {
	console.log('import.meta', import.meta);
	let user = {} as any;
	const hexabase = await createClient({
		url,
		token: '',
		email,
		password
	});
	const { token, error } = await hexabase.auth.login({ email, password });
	if (token && !error) {
		const { userInfo, error } = await hexabase.users.get(token);
		if (userInfo && !error) {
			user = userInfo;
			user.token = token;
		}
		localStorage.setItem('user', JSON.stringify(user));
	}
	return token;
}

async function logout() {
	localStorage.removeItem('user');
}

function register() {
	return { user: 'nguyen' };
}

export const userService = {
	login,
	logout,
	register
};
