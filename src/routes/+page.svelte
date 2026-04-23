<script lang="ts">
	import StatusBar from '$lib/components/StatusBar.svelte';
	import SearchHero from '$lib/components/SearchHero.svelte';

	let { data } = $props();
</script>

<StatusBar meta={data.meta} />

<main>
	<SearchHero />
</main>
