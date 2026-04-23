<script lang="ts">
	import SearchHero from '$lib/components/SearchHero.svelte';
	import MigrationTicker from '$lib/components/MigrationTicker.svelte';

	let { data } = $props();
</script>

<main class="page-main">
	<SearchHero />
</main>

<MigrationTicker packages={data.attempting?.sources ?? []} />
