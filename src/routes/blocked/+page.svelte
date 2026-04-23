<script lang="ts">
	import { goto } from '$app/navigation';
	import VerdictBadge from '$lib/components/VerdictBadge.svelte';

	let { data } = $props();
	const blocked = $derived(data.blocked);

	let openIndex = $state<number | null>(null);

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

	function handleSort(field: string) {
		const newOrder = blocked.sort === field && blocked.order === 'asc' ? 'desc' : 'asc';
		goto(buildUrl({ sort: field, order: newOrder }));
	}

	function sortIndicator(field: string): string {
		if (blocked.sort !== field) return '';
		return blocked.order === 'asc' ? ' ▲' : ' ▼';
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

			<div class="p-sort-controls">
				<span class="u-text--muted">Sort by:</span>
				<button
					class="p-button--base"
					class:is-active={blocked.sort === 'age'}
					onclick={() => handleSort('age')}
				>
					Age{sortIndicator('age')}
				</button>
				<button
					class="p-button--base"
					class:is-active={blocked.sort === 'name'}
					onclick={() => handleSort('name')}
				>
					Name{sortIndicator('name')}
				</button>
			</div>
		</div>
	</div>
</section>

<section class="p-strip u-no-padding--top">
	<div class="row">
		<div class="col-12">
			{#if blocked.sources.length === 0}
				<p>No blocked packages found.</p>
			{:else}
			<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
				<aside class="p-accordion" role="tablist" aria-multiselectable="true">
					<ul class="p-accordion__list">
						{#each blocked.sources as src, i}
							{@const isOpen = openIndex === i}
							<li class="p-accordion__group">
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
										<strong>{src.source_package}</strong>
										<span class="u-text--muted" style="margin-left: 0.75rem;">
											{src.old_version} → {src.new_version}
										</span>
										{#if src.excuse_detail}
											<span class="p-accordion__excuse">{src.excuse_detail}</span>
										{/if}
									</span>
								</div>

								{#if isOpen}
									<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
									<section
										role="tabpanel"
										class="p-accordion__panel"
										id="panel-blocked-{i}"
										aria-labelledby="tab-blocked-{i}"
									>
										<table class="p-table--mobile-card" aria-label="Details for {src.source_package}">
											<tbody>
												<tr>
													<th>Verdict</th>
													<td><VerdictBadge verdict={src.verdict} /></td>
												</tr>
												<tr>
													<th>Age (days)</th>
													<td>{src.age}</td>
												</tr>
												{#if src.excuse_detail}
													<tr>
														<th>Excuse</th>
														<td>{src.excuse_detail}</td>
													</tr>
												{/if}
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
											<a href="/sources/{encodeURIComponent(src.source_package)}">
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
										href="/blocked?offset={Math.max(0, blocked.offset - blocked.limit)}&limit={blocked.limit}&sort={blocked.sort}&order={blocked.order}"
									>
										<span class="p-pagination__label">Previous</span>
									</a>
								</li>
							{/if}
							<li class="p-pagination__item">
								<span class="u-text--muted">
									{blocked.offset + 1}–{Math.min(blocked.offset + blocked.limit, blocked.total)} of {blocked.total.toLocaleString()}
								</span>
							</li>
							{#if blocked.offset + blocked.limit < blocked.total}
								<li class="p-pagination__item">
									<a
										class="p-pagination__link--next"
										href="/blocked?offset={blocked.offset + blocked.limit}&limit={blocked.limit}&sort={blocked.sort}&order={blocked.order}"
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
	.p-sort-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.p-sort-controls .is-active {
		font-weight: 600;
	}

	.p-accordion__excuse {
		font-size: 0.875rem;
		color: #666;
		font-weight: 400;
		margin-left: 0.75rem;
	}
</style>
