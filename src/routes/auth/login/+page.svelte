<script lang="ts">
	import EyeIcon from '$lib/images/EyeIcon.svelte';
	import EyeSlashIcon from '$lib/images/EyeSlashIcon.svelte';
	import { page } from '$app/stores';
	import { error, redirect } from '@sveltejs/kit';
	import { goto } from '$app/navigation';
	import { userService } from './+page';
	import LoadingComp from '$lib/components/skeleton/LoadingComp.svelte';
	let showPassword = false;
	$: type = showPassword ? 'text' : 'password';
	let loginInput = {
		email: '',
		password: ''
	};

	export let loading = false;

	function typeAction(node: HTMLInputElement) {
		node.type = type;
	}

	const handleLogin = async () => {
		loading = true;
		const token = await userService.login(loginInput.email, loginInput.password);
		loading = false;
		token && goto('/workspaces');
	};
</script>

<div class="flex flex-col items-center bg-white dark:bg-gray-900">
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
							class="flex w-full px-3 py-4 text-white bg-green-600 rounded-md hover:bg-green-500 ease-out duration-300 focus:bg-green-500 focus:outline-none"
						>
							{#if loading}
								<LoadingComp {loading} />
							{/if}
							<span class="flex-1 ease-in-out duration-500">Sign in</span>
						</button>
					</div>
					<p class="text-sm text-center text-gray-400">
						Don&#x27;t have an account yet? <a
							href="#!"
							class="text-green-600 focus:outline-none focus:underline focus:text-green-500 dark:focus:border-indigo-800"
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
