<script lang="ts">
	import VerdictBadge from '$lib/components/VerdictBadge.svelte';

	let { data } = $props();
	const name = $derived(data.name);
	const packageEntries = $derived(Object.entries(data.autopkgtest.packages));

	// Collect all unique arches across all packages, sorted
	const allArches = $derived(
		[...new Set(packageEntries.flatMap(([, arches]) => Object.keys(arches)))].sort()
	);
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

<section class="p-strip u-no-padding--top">
	<div class="row">
		<div class="col-12">
			{#if packageEntries.length === 0}
				<p class="p-text--default">No autopkgtest results available for this package.</p>
			{:else}
				<div class="autopkgtest-matrix-wrap">
					<table class="autopkgtest-matrix" aria-label="Autopkgtest results matrix">
						<thead>
							<tr>
								<th class="col-pkg">Package</th>
								{#each allArches as arch}
									<th class="col-arch">{arch}</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each packageEntries as [pkgVersion, arches]}
								<tr>
									<td class="col-pkg">{pkgVersion}</td>
									{#each allArches as arch}
										{@const result = arches[arch]}
										<td class="col-arch col-result">
											{#if result}
												<VerdictBadge verdict={result.status} />
												{#if result.log_url || result.pkg_url}
													<span class="result-links">
														{#if result.log_url}
															<a href={result.log_url} target="_blank" rel="noopener">Log</a>
														{/if}
														{#if result.pkg_url}
															<a href={result.pkg_url} target="_blank" rel="noopener">Pkg</a>
														{/if}
													</span>
												{/if}
											{:else}
												<span class="u-text--muted">—</span>
											{/if}
										</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>
</section>

<style lang="scss">
	.autopkgtest-matrix-wrap {
		overflow-x: auto;
	}

	.autopkgtest-matrix {
		width: 100%;
		border-collapse: collapse;
		white-space: nowrap;
	}

	.autopkgtest-matrix th,
	.autopkgtest-matrix td {
		padding: 0.5rem 0.75rem;
		vertical-align: middle;
		border-bottom: 1px solid #d9d9d9;
	}

	.autopkgtest-matrix thead th {
		border-bottom: 2px solid #d9d9d9;
		font-weight: 600;
	}

	.col-pkg {
		text-align: left;
		min-width: 12rem;
		max-width: 22rem;
		white-space: normal;
		word-break: break-all;
	}

	.col-arch {
		text-align: center;
	}

	.col-result {
		min-width: 7rem;
	}

	.result-links {
		display: flex;
		justify-content: center;
		gap: 0.4rem;
		margin-top: 0.2rem;
		font-size: 0.75rem;
	}
</style>
