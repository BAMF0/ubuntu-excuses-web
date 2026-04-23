<script lang="ts">
	import VerdictBadge from '$lib/components/VerdictBadge.svelte';

	let { data } = $props();
	const name = $derived(data.name);
	const packageEntries = $derived(Object.entries(data.autopkgtest.packages));
</script>

<svelte:head>
	<title>Autopkgtest – {name} – Ubuntu Excuses Explorer</title>
</svelte:head>

<section class="p-strip u-no-padding--bottom">
	<div class="row">
		<div class="col-12">
			<p>
				<a href="/sources/{encodeURIComponent(name)}">← Back to {name}</a>
			</p>
			<h1 class="p-heading--2">{name} – Autopkgtest results</h1>
			<p>
				<strong>Overall verdict:</strong>
				<VerdictBadge verdict={data.autopkgtest.verdict} />
			</p>
		</div>
	</div>
</section>

{#each packageEntries as [pkgVersion, arches]}
	<section class="p-strip u-no-padding--top">
		<div class="row">
			<div class="col-12">
				<h2 class="p-heading--4">{pkgVersion}</h2>
				<table aria-label="Autopkgtest results for {pkgVersion}">
					<thead>
						<tr>
							<th>Architecture</th>
							<th>Status</th>
							<th>Links</th>
						</tr>
					</thead>
					<tbody>
						{#each Object.entries(arches) as [arch, result]}
							<tr>
								<td>{arch}</td>
								<td><VerdictBadge verdict={result.status} /></td>
								<td>
									{#if result.log_url}
										<a href={result.log_url} target="_blank" rel="noopener">Log</a>
									{/if}
									{#if result.log_url && result.pkg_url}
										{' · '}
									{/if}
									{#if result.pkg_url}
										<a href={result.pkg_url} target="_blank" rel="noopener"
											>Package</a
										>
									{/if}
									{#if !result.log_url && !result.pkg_url}
										—
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>
{:else}
	<section class="p-strip u-no-padding--top">
		<div class="row">
			<div class="col-12">
				<p class="p-text--default">No autopkgtest results available for this package.</p>
			</div>
		</div>
	</section>
{/each}
