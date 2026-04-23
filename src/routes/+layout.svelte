<script lang="ts">
	import '$lib/styles/app.scss';
	import favicon from '$lib/assets/favicon.svg';
	import StatusBar from '$lib/components/StatusBar.svelte';

	let { data, children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Ubuntu Excuses Explorer</title>
</svelte:head>

<StatusBar meta={data.meta} />

{@render children()}
