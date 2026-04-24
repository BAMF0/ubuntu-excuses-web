<script lang="ts">
	import VerdictBadge from '$lib/components/VerdictBadge.svelte';

	let { data } = $props();
	const sources = $derived(data.sources);
	const q = $derived(data.q);
	const depends = $derived(data.depends);

	let queryInput = $state('');
	let dependsInput = $state('');

	$effect(() => {
		queryInput = data.q;
		dependsInput = data.depends;
	});

	function buildUrl(overrides: Record<string, string>) {
		const params: Record<string, string> = {
			q: q,
			depends: depends,
			sort: sources.sort,
			order: sources.order,
			limit: String(sources.limit),
			offset: '0',
			...overrides
		};
		// Drop empty values to keep URLs clean.
		const filtered = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ''));
		return `/search?${new URLSearchParams(filtered)}`;
	}

	function search() {
		const params: Record<string, string> = {};
		if (queryInput.trim()) params.q = queryInput.trim();
		if (dependsInput.trim()) params.depends = dependsInput.trim();
		location.href = `/search?${new URLSearchParams(params)}`;
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		search();
	}

	function sourceHref(name: string) {
		const back = buildUrl({});
		return `/sources/${encodeURIComponent(name)}?from=search&backUrl=${encodeURIComponent(back)}`;
	}
</script>

<svelte:head>
	<title>
		{q ? `Results for "${q}"` : depends ? `Depends on "${depends}"` : 'Search'} – Ubuntu Excuses
		Explorer
	</title>
</svelte:head>

<section class="p-strip">
	<div class="row">
		<div class="col-12">
			<a href="/" class="p-back-link">← Back to home</a>
			<h1 class="p-heading--2 u-sv2">
				{#if q && depends}
					Results for <em>{q}</em> depending on <em>{depends}</em>
				{:else if q}
					Results for <em>"{q}"</em>
				{:else if depends}
					Packages depending on <em>"{depends}"</em>
				{:else}
					Search
				{/if}
			</h1>

			<form class="search-form" onsubmit={handleSubmit}>
				<div class="search-row">
					<div class="search-field">
						<label class="p-form__label" for="sr-query">Package name</label>
						<input
							type="search"
							id="sr-query"
							class="p-form__control"
							placeholder="e.g. python3"
							bind:value={queryInput}
							autocomplete="off"
						/>
					</div>
					<div class="search-field">
						<label class="p-form__label" for="sr-depends">Depends on</label>
						<input
							type="search"
							id="sr-depends"
							class="p-form__control"
							placeholder="e.g. libssl3"
							bind:value={dependsInput}
							autocomplete="off"
						/>
					</div>
					<div class="search-actions">
						<button type="submit" class="p-button--positive search-btn">Search</button>
					</div>
				</div>
			</form>
		</div>
	</div>
</section>

<section class="p-strip u-no-padding--top">
	<div class="row">
		<div class="col-12">
			{#if !q && !depends}
				<p>Enter a package name or dependency above to search.</p>
			{:else if sources.total === 0}
				<p>No packages found matching your search.</p>
			{:else}
				<div class="results-header">
					<p class="u-text--muted">
						Showing {sources.offset + 1}–{Math.min(
							sources.offset + sources.limit,
							sources.total
						)} of {sources.total.toLocaleString()} result{sources.total === 1 ? '' : 's'}
					</p>
					<div class="sort-controls">
						<label class="sort-label" for="sort-select">Sort by</label>
						<select
							id="sort-select"
							class="p-form__control sort-select"
							value={sources.sort}
							onchange={(e) => (location.href = buildUrl({ sort: e.currentTarget.value }))}
						>
							<option value="name">Name</option>
							<option value="age">Age</option>
						</select>
						<button
							class="p-button--base direction-btn"
							onclick={() => (location.href = buildUrl({ order: sources.order === 'asc' ? 'desc' : 'asc' }))}
							title={sources.order === 'asc'
								? 'Currently ascending – click to sort descending'
								: 'Currently descending – click to sort ascending'}
						>
							{sources.order === 'asc' ? '↑ Ascending' : '↓ Descending'}
						</button>
					</div>
				</div>

				<table class="p-table--mobile-card results-table">
					<thead>
						<tr>
							<th>Package</th>
							<th>Versions</th>
							<th>Verdict</th>
							<th>Status</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each sources.sources as src}
							<tr>
								<td data-heading="Package">
									<strong
										><a href={sourceHref(src.source_package)}
											>{src.source_package}</a
										></strong
									>
								</td>
								<td data-heading="Versions" class="version-cell">
									<span class="u-text--muted"
										>{src.old_version} → {src.new_version}</span
									>
								</td>
								<td data-heading="Verdict">
									<VerdictBadge verdict={src.verdict} />
								</td>
								<td data-heading="Status" class="u-text--muted status-cell">
									{src.migration_status}
								</td>
								<td class="action-cell">
									<a href={sourceHref(src.source_package)}>Details →</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>

				{#if sources.total > sources.limit}
					<nav class="p-pagination" aria-label="Pagination">
						<ol class="p-pagination__items">
							{#if sources.offset > 0}
								<li class="p-pagination__item">
									<a
										class="p-pagination__link--previous"
										href={buildUrl({
											offset: String(Math.max(0, sources.offset - sources.limit))
										})}
									>
										<span class="p-pagination__label">Previous</span>
									</a>
								</li>
							{/if}
							<li class="p-pagination__item">
								<span class="u-text--muted">
									{sources.offset + 1}–{Math.min(
										sources.offset + sources.limit,
										sources.total
									)} of {sources.total.toLocaleString()}
								</span>
							</li>
							{#if sources.offset + sources.limit < sources.total}
								<li class="p-pagination__item">
									<a
										class="p-pagination__link--next"
										href={buildUrl({ offset: String(sources.offset + sources.limit) })}
									>
										<span class="p-pagination__label">Next</span>
									</a>
								</li>
							{/if}
						</ol>
					</nav>
				{/if}
			{/if}
		</div>
	</div>
</section>

<style lang="scss">
	/* ── Search form ─────────────────────────────────────────────── */
	.search-form {
		margin-bottom: 1rem;
	}

	.search-row {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 1rem;
	}

	.search-field {
		flex: 1;
		min-width: 12rem;

		.p-form__label {
			display: block;
			margin-bottom: 0.25rem;
		}

		.p-form__control {
			width: 100%;
			margin-bottom: 0;
		}
	}

	.search-actions {
		flex-shrink: 0;
	}

	.search-btn {
		margin-bottom: 0;
	}

	/* ── Results header ──────────────────────────────────────────── */
	.results-header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 1rem;

		p {
			margin-bottom: 0;
		}
	}

	.sort-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.sort-label {
		color: #666;
		white-space: nowrap;
	}

	.sort-select {
		margin-bottom: 0;
		width: auto;
	}

	.direction-btn {
		margin-bottom: 0;
		white-space: nowrap;
	}

	/* ── Results table ───────────────────────────────────────────── */
	.results-table {
		width: 100%;
	}

	.version-cell {
		font-size: 0.875rem;
		white-space: nowrap;
	}

	.status-cell {
		font-size: 0.875rem;
	}

	.action-cell {
		white-space: nowrap;
		text-align: right;
	}

	.p-back-link {
		display: inline-block;
		margin-bottom: 1rem;
	}
</style>
