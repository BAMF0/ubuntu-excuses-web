<script lang="ts">
	import { goto } from '$app/navigation';
	import VerdictBadge from '$lib/components/VerdictBadge.svelte';

	let { data } = $props();
	const blocked = $derived(data.blocked);

	let openIndex = $state<number | null>(null);
	let searchQuery = $state('');

	const displayedSources = $derived(
		searchQuery.trim()
			? blocked.sources.filter((s) =>
					s.source_package.toLowerCase().includes(searchQuery.trim().toLowerCase())
				)
			: blocked.sources
	);

	function toggle(i: number) {
		openIndex = openIndex === i ? null : i;
	}

	function buildUrl(overrides: Record<string, string>) {
		const params: Record<string, string> = {
			sort: blocked.sort,
			order: blocked.order,
			limit: String(blocked.limit),
			offset: '0',
			...overrides
		};
		return `/blocked?${new URLSearchParams(params)}`;
	}

	function formatAge(days: number): { value: string; unit: string } {
		if (days < 1 / 24 / 60) {
			return { value: Math.round(days * 24 * 60 * 60).toString(), unit: 'seconds' };
		} else if (days < 1 / 24) {
			return { value: Math.round(days * 24 * 60).toString(), unit: 'minutes' };
		} else if (days < 1) {
			return { value: (Math.round(days * 24 * 10) / 10).toString(), unit: 'hours' };
		} else {
			return { value: (Math.round(days * 10) / 10).toString(), unit: 'days' };
		}
	}

	function verdictColor(verdict: string): string {
		const v = verdict.toUpperCase();
		if (v === 'PASS' || v === 'WILL_ATTEMPT') return '#0e8420';
		if (v.startsWith('REJECTED') || v === 'BLOCKED') return '#c7162b';
		if (v === 'WAITING' || v.includes('TEMPORARY')) return '#f99b11';
		return '#757575';
	}
</script>

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

				<div class="toolbar__sort">
					<label class="toolbar__sort-label" for="sort-select">Sort by</label>
					<select
						id="sort-select"
						class="p-form__control toolbar__sort-select"
						value={blocked.sort}
						onchange={(e) => goto(buildUrl({ sort: e.currentTarget.value }))}
					>
						<option value="age">Age</option>
						<option value="name">Name</option>
					</select>
					<button
						class="p-button--base toolbar__direction-btn"
						onclick={() => goto(buildUrl({ order: blocked.order === 'asc' ? 'desc' : 'asc' }))}
						title={blocked.order === 'asc'
							? 'Currently ascending – click to sort descending'
							: 'Currently descending – click to sort ascending'}
					>
						{blocked.order === 'asc' ? '↑ Ascending' : '↓ Descending'}
					</button>
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
				<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
				<aside class="p-accordion blocked-accordion" role="tablist" aria-multiselectable="true">
					<ul class="p-accordion__list">
						{#each displayedSources as src, i}
							{@const isOpen = openIndex === i}
							<li
								class="p-accordion__group"
								style="border-left: 3px solid {verdictColor(src.verdict)}"
							>
								<div
									role="tab"
									class="p-accordion__tab"
									id="tab-blocked-{i}"
									aria-controls="panel-blocked-{i}"
									aria-expanded={isOpen}
									tabindex="0"
									onclick={() => toggle(i)}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											toggle(i);
										}
									}}
								>
									<span class="p-accordion__title">
										<span class="accordion-header">
											<span class="accordion-col-left">
												<strong>{src.source_package}</strong>
												<span class="u-text--muted version-range">
													{src.old_version} → {src.new_version}
												</span>
											</span>
											<span class="accordion-col-right">
												{#if src.excuse_detail}
													<span class="accordion-excuse">{src.excuse_detail}</span>
												{/if}
											</span>
										</span>
									</span>
								</div>

								{#if isOpen}
									{@const a = formatAge(src.age)}
									<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
									<section
										role="tabpanel"
										class="p-accordion__panel"
										id="panel-blocked-{i}"
										aria-labelledby="tab-blocked-{i}"
									>
										{#if src.excuse_detail}
											<p class="excuse-note">{src.excuse_detail}</p>
										{/if}

										<table
											class="p-table--mobile-card"
											aria-label="Details for {src.source_package}"
										>
											<tbody>
												<tr>
													<th>Verdict</th>
													<td><VerdictBadge verdict={src.verdict} /></td>
												</tr>
												<tr>
													<th>Age</th>
													<td>{a.value} {a.unit}</td>
												</tr>
											</tbody>
										</table>

										{#if src.dependencies}
											{#if src.dependencies.blocked_by && src.dependencies.blocked_by.length > 0}
												<p><strong>Blocked by:</strong></p>
												<ul class="p-list--divided">
													{#each src.dependencies.blocked_by as dep}
														<li class="p-list__item">
															<a href="/sources/{encodeURIComponent(dep)}">{dep}</a>
														</li>
													{/each}
												</ul>
											{/if}
											{#if src.dependencies.blocks && src.dependencies.blocks.length > 0}
												<p><strong>Blocks:</strong></p>
												<ul class="p-list--divided">
													{#each src.dependencies.blocks as dep}
														<li class="p-list__item">
															<a href="/sources/{encodeURIComponent(dep)}">{dep}</a>
														</li>
													{/each}
												</ul>
											{/if}
											{#if src.dependencies.migrate_after && src.dependencies.migrate_after.length > 0}
												<p><strong>Migrate after:</strong></p>
												<ul class="p-list--divided">
													{#each src.dependencies.migrate_after as dep}
														<li class="p-list__item">
															<a href="/sources/{encodeURIComponent(dep)}">{dep}</a>
														</li>
													{/each}
												</ul>
											{/if}
										{/if}

										{#if src.hints && src.hints.length > 0}
											<p><strong>Hints:</strong></p>
											<ul class="p-list--divided">
												{#each src.hints as hint}
													<li class="p-list__item">{hint.type} (from {hint.from})</li>
												{/each}
											</ul>
										{/if}

										<p>
											<a href="/sources/{encodeURIComponent(src.source_package)}?from=blocked">
												View full details →
											</a>
										</p>
									</section>
								{/if}
							</li>
						{/each}
					</ul>
				</aside>

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
		min-width: 12rem;
	}

	.toolbar__search-input {
		width: 100%;
		margin-bottom: 0;
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

	/* ── Accordion overrides ───────────────────────────────────── */

	/* Vanilla assumes p-accordion__tab is a <button> (display: inline-flex).
	   Since we use a <div> for accessibility reasons, we must set flex explicitly. */
	.p-accordion__tab {
		display: flex;
		align-items: center;
	}

	.p-accordion__title {
		flex: 1;
		min-width: 0;
	}

	.accordion-header {
		display: grid;
		grid-template-columns: 3fr 2fr;
		align-items: center;
		width: 100%;
		gap: 1rem;
	}

	.accordion-col-left {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		min-width: 0;
		overflow: hidden;
	}

	.version-range {
		font-size: 0.875rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.accordion-col-right {
		min-width: 0;
		text-align: right;
	}

	.accordion-excuse {
		font-size: 0.875rem;
		color: #666;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		display: block;
	}

	/* ── Expanded panel ────────────────────────────────────────── */
	.excuse-note {
		background: #f5f5f5;
		border-left: 4px solid #d9d9d9;
		border-radius: 0 2px 2px 0;
		color: #3c3c3c;
		font-size: 0.875rem;
		margin-bottom: 1rem;
		padding: 0.5rem 0.75rem;
	}
</style>
