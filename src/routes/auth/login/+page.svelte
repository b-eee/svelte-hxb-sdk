<script lang="ts">
	import EyeIcon from '$lib/images/EyeIcon.svelte';
	import EyeSlashIcon from '$lib/images/EyeSlashIcon.svelte';
	import { page } from '$app/stores';
	import { error, redirect } from '@sveltejs/kit';
	import { goto } from '$app/navigation';
	import { userService } from './+page';
	let showPassword = false;
	$: type = showPassword ? 'text' : 'password';
	let loginInput = {
		email: '',
		password: ''
	};

	function typeAction(node: HTMLInputElement) {
		node.type = type;
	}

	const handleLogin = async () => {
		const token = await userService.login(loginInput.email, loginInput.password);
		token && goto('/workspaces');
	};
</script>

<div class="flex items-center bg-white dark:bg-gray-900">
	<div class="container mx-auto">
		<div class="max-w-md mx-auto my-10">
			<div class="text-center">
				<h1 class="my-3 text-3xl font-semibold text-gray-700 dark:text-gray-200">Sign in</h1>
				<p class="text-gray-500 dark:text-gray-400">To access hexabase ultilities</p>
			</div>
			<div class="m-7">
				<form>
					<div class="mb-6">
						<label for="email" class="block mb-2 text-sm text-gray-600 dark:text-gray-400"
							>Email</label
						>
						<input
							type="email"
							name="email"
							id="email"
							placeholder="example@gmail.com"
							class="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-300 focus:outline-none"
							bind:value={loginInput.email}
						/>
					</div>
					<div class="mb-6">
						<div class="flex justify-between mb-2">
							<label for="password" class="text-sm text-gray-600 dark:text-gray-400">Password</label
							>
						</div>
						<div
							class="flex w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring"
						>
							<input
								class="grow w-full placeholder-gray-300 border-none focus:outline-none"
								use:typeAction
								name="password"
								id="password"
								placeholder="password"
								bind:value={loginInput.password}
							/>
							{#if showPassword}
								<button on:click={() => (showPassword = false)}><EyeIcon /></button>
							{:else}
								<button on:click={() => (showPassword = true)}><EyeSlashIcon /></button>
							{/if}
						</div>
					</div>
					<div class="mb-6">
						<button
							on:click={handleLogin}
							type="button"
							class="w-full px-3 py-4 text-white bg-indigo-500 rounded-md focus:bg-indigo-600 focus:outline-none"
							>Sign in</button
						>
					</div>
					<p class="text-sm text-center text-gray-400">
						Don&#x27;t have an account yet? <a
							href="#!"
							class="text-indigo-400 focus:outline-none focus:underline focus:text-indigo-500 dark:focus:border-indigo-800"
							>Sign up</a
						>.
					</p>
				</form>
			</div>
		</div>
	</div>
</div>

<style>
	::-webkit-input-placeholder {
		/* Edge */
		font-style: italic;
	}

	:-ms-input-placeholder {
		/* Internet Explorer 10-11 */
		font-style: italic;
	}

	::placeholder {
		font-style: italic;
	}
</style>
