<script lang="ts">
	import '$lib/styles/app.scss';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Ubuntu Excuses Explorer</title>
</svelte:head>

{@render children()}
