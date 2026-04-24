<script lang="ts">
	import VerdictBadge from '$lib/components/VerdictBadge.svelte';

	let { data } = $props();
	const blocked = $derived(data.blocked);
	const allTeams = $derived(data.meta?.teams ?? []);

	/* ── Team filter (multi-select, server-side via URL) ────────── */
	let selectedTeams = $state<Set<string>>(new Set<string>());
	let dropdownOpen = $state(false);

	// Keep selected teams in sync when the page data changes (e.g. pagination/sort nav).
	$effect(() => {
		selectedTeams = new Set(data.teams);
	});

	// On first mount: if the URL carries no teams, restore from localStorage.
	$effect(() => {
		if (data.teams.length === 0) {
			try {
				const saved = localStorage.getItem('blockedTeams');
				if (saved) {
					const restored: string[] = JSON.parse(saved);
					if (restored.length > 0) {
						location.href = buildUrl({ teams: new Set(restored) });
					}
				}
			} catch {
				// ignore malformed localStorage data
			}
		}
	});

	function toggleTeam(team: string) {
		const next = new Set(selectedTeams);
		if (next.has(team)) next.delete(team);
		else next.add(team);
		selectedTeams = next;
		saveTeams(next);
		location.href = buildUrl({ teams: next });
	}

	function clearTeams() {
		selectedTeams = new Set();
		saveTeams(new Set());
		location.href = buildUrl({ teams: new Set() });
	}

	function saveTeams(teams: Set<string>) {
		try {
			localStorage.setItem('blockedTeams', JSON.stringify([...teams]));
		} catch {
			// ignore (e.g. private browsing with storage disabled)
		}
	}

	let searchQuery = $state('');

	/* ── Expand / collapse state ───────────────────────────────── */
	let allExpanded = $state(false);
	/* Rows individually toggled away from the global state. */
	let overrides = $state(new Set<number>());

	/* Read saved preference once after mount (localStorage is browser-only). */
	$effect(() => {
		const saved = localStorage.getItem('blockedExpandAll');
		if (saved !== null) allExpanded = saved === 'true';
	});

	function isOpen(i: number): boolean {
		return allExpanded ? !overrides.has(i) : overrides.has(i);
	}

	function toggle(i: number) {
		const next = new Set(overrides);
		if (next.has(i)) next.delete(i);
		else next.add(i);
		overrides = next;
	}

	function setAllExpanded(val: boolean) {
		allExpanded = val;
		overrides = new Set();
		localStorage.setItem('blockedExpandAll', String(val));
	}

	/* ── Derived / filtered list ───────────────────────────────── */
	const displayedSources = $derived(
		searchQuery.trim()
			? blocked.sources.filter((s) =>
					s.source_package.toLowerCase().includes(searchQuery.trim().toLowerCase())
				)
			: blocked.sources
	);

	/* ── Helpers ────────────────────────────────────────────────── */
	interface BuildUrlOpts {
		teams?: Set<string>;
		sort?: string;
		order?: string;
		offset?: string;
		limit?: string;
	}

	function buildUrl({ teams = selectedTeams, sort, order, offset, limit }: BuildUrlOpts = {}) {
		const base: Record<string, string> = {
			sort: sort ?? blocked.sort,
			order: order ?? blocked.order,
			limit: limit ?? String(blocked.limit),
			offset: offset ?? '0',
		};
		const params = new URLSearchParams(
			Object.fromEntries(Object.entries(base).filter(([, v]) => v !== ''))
		);
		for (const t of teams) params.append('team', t);
		return `/blocked?${params}`;
	}

	function numFailures(src: (typeof blocked.sources)[number]): number {
		return src.dependencies?.blocked_by?.length ?? 0;
	}

	function ageDays(age: number): string {
		if (age < 1) return '<1';
		return Math.round(age).toString();
	}

	/* Close dropdown when clicking outside */
	function onWindowClick(e: MouseEvent) {
		if (dropdownOpen && !(e.target as Element).closest('.toolbar__team')) {
			dropdownOpen = false;
		}
	}
</script>

<svelte:window onclick={onWindowClick} />

<svelte:head>
	<title>Blocked Packages – Ubuntu Excuses Explorer</title>
</svelte:head>

<section class="p-strip">
	<div class="row">
		<div class="col-12">
			<h1 class="p-heading--2">Blocked Packages</h1>
			<p class="u-text--muted">
				{blocked.total.toLocaleString()} packages blocked from migration.
			</p>

			<div class="toolbar">
				<div class="toolbar__search">
					<label class="u-off-screen" for="pkg-search">Filter packages</label>
					<input
						type="search"
						id="pkg-search"
						class="p-form__control toolbar__search-input"
						placeholder="Filter by package name on this page…"
						bind:value={searchQuery}
					/>
				</div>

				<div class="toolbar__team">
					<button
						class="p-button--base toolbar__team-btn"
						class:is-active={selectedTeams.size > 0}
						onclick={(e) => { e.stopPropagation(); dropdownOpen = !dropdownOpen; }}
						aria-haspopup="listbox"
						aria-expanded={dropdownOpen}
					>
						{#if selectedTeams.size === 0}
							All teams ▾
						{:else if selectedTeams.size === 1}
							{[...selectedTeams][0]} ▾
						{:else}
							{selectedTeams.size} teams ▾
						{/if}
					</button>
					<button
						class="p-button--base toolbar__team-clear"
						style:visibility={selectedTeams.size > 0 ? 'visible' : 'hidden'}
						onclick={clearTeams}
						title="Clear team filter"
						tabindex={selectedTeams.size === 0 ? -1 : 0}
					>✕</button>

					{#if dropdownOpen}
						<div class="team-dropdown" role="listbox" aria-multiselectable="true">
							{#each allTeams as team}
								{@const checked = selectedTeams.has(team)}
								<label class="team-option" class:is-checked={checked}>
									<input
										type="checkbox"
										{checked}
										onchange={() => toggleTeam(team)}
									/>
									{team}
								</label>
							{/each}
						</div>
					{/if}
				</div>

				<div class="toolbar__sort">
					<label class="toolbar__sort-label" for="sort-select">Sort by</label>
					<select
						id="sort-select"
						class="p-form__control toolbar__sort-select"
						value={blocked.sort}
						onchange={(e) => (location.href = buildUrl({ sort: e.currentTarget.value }))}
					>
						<option value="age">Age</option>
						<option value="name">Name</option>
					</select>
					<button
						class="p-button--base toolbar__direction-btn"
						onclick={() => (location.href = buildUrl({ order: blocked.order === 'asc' ? 'desc' : 'asc' }))}
						title={blocked.order === 'asc'
							? 'Currently ascending – click to sort descending'
							: 'Currently descending – click to sort ascending'}
					>
						{blocked.order === 'asc' ? '↑ Ascending' : '↓ Descending'}
					</button>
				</div>

				<div class="toolbar__limit">
					<label class="toolbar__sort-label" for="limit-select">Per page</label>
					<select
						id="limit-select"
						class="p-form__control toolbar__sort-select"
						value={String(blocked.limit)}
						onchange={(e) => (location.href = buildUrl({ limit: e.currentTarget.value }))}
					>
						<option value="10">10</option>
						<option value="50">50</option>
						<option value="100">100</option>
					</select>
				</div>

				<div class="toolbar__expand">
					{#if allExpanded}
						<button class="p-button--base" onclick={() => setAllExpanded(false)}>
							Collapse all
						</button>
					{:else}
						<button class="p-button--base" onclick={() => setAllExpanded(true)}>
							Expand all
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
</section>

<section class="p-strip u-no-padding--top">
	<div class="row">
		<div class="col-12">
			{#if displayedSources.length === 0}
				<p>
					{searchQuery.trim()
						? `No packages match "${searchQuery}" on this page.`
						: 'No blocked packages found.'}
				</p>
			{:else}
				<div class="table-scroll-wrapper">
					<table class="p-table blocked-table">
						<thead>
							<tr>
								<th class="col-expand"></th>
								<th>Source Package</th>
								<th>Versions</th>
								<th class="col-num u-align--right">Failures</th>
								<th class="col-num u-align--right">Age (days)</th>
								<th>Verdict</th>
							</tr>
						</thead>
						<tbody>
							{#each displayedSources as src, i}
								{@const open = isOpen(i)}
								<tr
									class="summary-row"
									class:is-open={open}
									onclick={() => toggle(i)}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											toggle(i);
										}
									}}
									role="button"
									tabindex="0"
									aria-expanded={open}
									aria-label="Toggle details for {src.source_package}"
								>
									<td class="col-expand">
										<span class="expand-chevron" aria-hidden="true">{open ? '▾' : '▸'}</span>
									</td>
									<td class="col-pkg">
										<strong>{src.source_package}</strong>
									</td>
									<td class="col-versions u-text--muted">
										<a
											href="https://launchpad.net/ubuntu/+source/{encodeURIComponent(src.source_package)}/{encodeURIComponent(src.old_version)}"
											target="_blank"
											rel="noopener noreferrer"
											onclick={(e) => e.stopPropagation()}
										>{src.old_version}</a>
										→
										<a
											href="https://launchpad.net/ubuntu/+source/{encodeURIComponent(src.source_package)}/{encodeURIComponent(src.new_version)}"
											target="_blank"
											rel="noopener noreferrer"
											onclick={(e) => e.stopPropagation()}
										>{src.new_version}</a>
									</td>
									<td class="col-num u-align--right">
										{numFailures(src)}
									</td>
									<td class="col-num u-align--right">
										{ageDays(src.age)}
									</td>
									<td class="col-verdict">
										<a
											href="/sources/{encodeURIComponent(src.source_package)}?from=blocked"
											onclick={(e) => e.stopPropagation()}
										>
											<VerdictBadge verdict={src.verdict} />
										</a>
									</td>
								</tr>

								{#if open}
									<tr class="detail-row">
										<td colspan="6" class="detail-cell">
											<div class="detail-inner">
												{#if src.excuse_detail}
													<span class="excuse-note">{src.excuse_detail}</span>
												{/if}

												<div class="detail-meta">
													{#if src.team}
														<span class="detail-group">
															<strong>Team:</strong>
															<a
																href="https://launchpad.net/~{encodeURIComponent(src.team)}"
																target="_blank"
																rel="noopener noreferrer"
																onclick={(e) => e.stopPropagation()}
															>{src.team}</a>
														</span>
													{/if}
													{#if src.dependencies?.blocked_by?.length}
														<span class="detail-group">
															<strong>Blocked by:</strong>
															{#each src.dependencies.blocked_by as dep, j}
																<a href="/sources/{encodeURIComponent(dep)}">{dep}</a>{j < src.dependencies.blocked_by.length - 1 ? ', ' : ''}
															{/each}
														</span>
													{/if}
													{#if src.dependencies?.blocks?.length}
														<span class="detail-group">
															<strong>Blocks:</strong>
															{#each src.dependencies.blocks as dep, j}
																<a href="/sources/{encodeURIComponent(dep)}">{dep}</a>{j < src.dependencies.blocks.length - 1 ? ', ' : ''}
															{/each}
														</span>
													{/if}
													{#if src.dependencies?.migrate_after?.length}
														<span class="detail-group">
															<strong>Migrate after:</strong>
															{#each src.dependencies.migrate_after as dep, j}
																<a href="/sources/{encodeURIComponent(dep)}">{dep}</a>{j < src.dependencies.migrate_after.length - 1 ? ', ' : ''}
															{/each}
														</span>
													{/if}
													{#if src.hints?.length}
														<span class="detail-group">
															<strong>Hints:</strong>
															{src.hints.map((h) => `${h.type} (${h.from})`).join(', ')}
														</span>
													{/if}
												</div>

												<div class="detail-links">
													<a href="/sources/{encodeURIComponent(src.source_package)}?from=blocked">
														View full details →
													</a>
													{#if src.has_autopkgtest}
														<a href="/sources/{encodeURIComponent(src.source_package)}/autopkgtest?from=blocked">
															Autopkgtests →
														</a>
													{/if}
												</div>
											</div>
										</td>
									</tr>
								{/if}
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Pagination -->
				{#if blocked.total > blocked.limit}
					<nav class="p-pagination" aria-label="Pagination">
						<ol class="p-pagination__items">
							{#if blocked.offset > 0}
								<li class="p-pagination__item">
									<a
										class="p-pagination__link--previous"
										href={buildUrl({
											offset: String(Math.max(0, blocked.offset - blocked.limit))
										})}
									>
										<span class="p-pagination__label">Previous</span>
									</a>
								</li>
							{/if}
							<li class="p-pagination__item">
								<span class="u-text--muted">
									{blocked.offset + 1}–{Math.min(
										blocked.offset + blocked.limit,
										blocked.total
									)} of {blocked.total.toLocaleString()}
								</span>
							</li>
							{#if blocked.offset + blocked.limit < blocked.total}
								<li class="p-pagination__item">
									<a
										class="p-pagination__link--next"
										href={buildUrl({
											offset: String(blocked.offset + blocked.limit)
										})}
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
	/* ── Toolbar ───────────────────────────────────────────────── */
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.toolbar__search {
		flex: 1;
		min-width: 10rem;
	}

	.toolbar__search-input {
		width: 100%;
		margin-bottom: 0;
	}

	.toolbar__team {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		flex-shrink: 0;
	}

	.toolbar__team-btn {
		margin-bottom: 0;
		white-space: nowrap;
		width: 12rem;
		overflow: hidden;
		text-overflow: ellipsis;
		text-align: left;

		&.is-active {
			font-weight: bold;
		}
	}

	.toolbar__team-clear {
		margin-bottom: 0;
		padding: 0 0.5rem;
		flex-shrink: 0;
	}

	.team-dropdown {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		z-index: 100;
		background: #fff;
		border: 1px solid #cdcdcd;
		border-radius: 2px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
		min-width: 14rem;
		max-height: 20rem;
		overflow-y: auto;
		padding: 0.25rem 0;
	}

	.team-option {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem 0.75rem;
		cursor: pointer;
		user-select: none;
		font-size: 0.875rem;

		&:hover {
			background: #f5f5f5;
		}

		&.is-checked {
			font-weight: bold;
		}

		input[type='checkbox'] {
			margin: 0;
			cursor: pointer;
		}
	}

	.toolbar__sort {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.toolbar__sort-label {
		color: #666;
		white-space: nowrap;
	}

	.toolbar__sort-select {
		margin-bottom: 0;
		width: auto;
	}

	.toolbar__direction-btn {
		margin-bottom: 0;
		white-space: nowrap;
	}

	.toolbar__limit {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.toolbar__expand {
		flex-shrink: 0;

		button {
			margin-bottom: 0;
		}
	}

	/* ── Table ─────────────────────────────────────────────────── */
	.table-scroll-wrapper {
		overflow-x: auto;
	}

	.blocked-table {
		width: 100%;

		.col-expand {
			width: 2rem;
			padding-right: 0;
		}

		.col-num {
			width: 7rem;
		}

		.col-versions {
			font-size: 0.875rem;
			white-space: nowrap;
		}

		.col-verdict {
			white-space: nowrap;
		}
	}

	/* ── Summary rows ──────────────────────────────────────────── */
	.summary-row {
		cursor: pointer;
		user-select: none;

		&:hover {
			background: #f5f5f5;
		}

		&.is-open {
			background: #f5f5f5;
		}
	}

	.expand-chevron {
		color: #666;
		font-size: 0.75rem;
	}

	/* ── Detail rows ───────────────────────────────────────────── */
	.detail-row {
		background: #fafafa;
	}

	.detail-cell {
		padding: 0.5rem 1rem 0.5rem 2.5rem !important;
		border-top: none !important;
	}

	.detail-inner {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.875rem;
	}

	.detail-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1.25rem;
		align-items: baseline;
	}

	.detail-group {
		white-space: normal;
	}

	.detail-links {
		display: flex;
		gap: 1rem;
		margin-top: 0.25rem;
	}

	/* ── Excuse callout ────────────────────────────────────────── */
	.excuse-note {
		display: block;
		width: 100%;
		color: #666;
		font-style: italic;
		margin-bottom: 0.125rem;
	}
</style>
