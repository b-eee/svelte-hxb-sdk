<script lang="ts">
	import { goto } from '$app/navigation';

	const handleClick = () => {
		goto('/auth/login');
	};
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Hexabase SDK + Svelte " />
</svelte:head>

<section class="flex items-center justify-center h-screen">
	<h1 class="text-3xl font-bold">Welcome to Hexabase</h1>
	<p>Example with Svelte framework</p>
	<button
		class="bg-emerald-400 px-4 py-2 mt-3 hover:bg-emerald-500 text-gray-50 ease-in-out duration-300"
		on:click={handleClick}>Login</button
	>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}
</style>
