<script>
	import '../../../src/app.css';
	import Header from '../Header.svelte';
	import '../../../src/app.css';
</script>

<div class="min-h-screen flex flex-col">
	<header>
		<Header />
	</header>
	<div class="flex-1 flex">
		<nav class="max-w-md">
			<div class="px-3 py-4 h-full overflow-y-auto rounded bg-gray-50 dark:bg-gray-800">
				<ul class="space-y-2">
					<li>
						<a
							href="/"
							class="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 hover:underline-offset-0"
						>
							<svg
								class="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
								<path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
							</svg>
							<span class="ml-3">Dashboard</span>
						</a>
					</li>
					<li>
						<a
							href="/workspaces"
							target="_blank"
							class="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 hover:underline-offset-0"
						>
							<svg
								class="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
								/>
							</svg>
							<span class="flex-1 ml-3 whitespace-nowrap">Workspaces</span>
						</a>
					</li>
				</ul>
			</div>
		</nav>
		<main class="flex-1">
			<slot />
		</main>
	</div>
	<footer class="bg-gray-100 p-2">Footer</footer>
</div>
