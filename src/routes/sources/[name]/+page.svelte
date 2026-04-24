<script lang="ts">
	import VerdictBadge from '$lib/components/VerdictBadge.svelte';
	import PolicyTable from '$lib/components/PolicyTable.svelte';

	let { data } = $props();
	const pkg = $derived(data.source);
	const backHref = $derived(
		data.from === 'blocked'
			? '/blocked'
			: data.from === 'search' && data.backUrl
				? data.backUrl
				: '/'
	);
	const backLabel = $derived(
		data.from === 'blocked'
			? '← Back to blocked'
			: data.from === 'search'
				? '← Back to search results'
				: '← Back to home'
	);

	/* ── Excuse info parsing ─────────────────────────────────── */
	type InfoCategory = 'candidate' | 'block' | 'bug' | 'depends' | 'build' | 'autopkgtest' | 'other';

	interface ParsedInfo {
		category: InfoCategory;
		raw: string;
		/* depends */
		dep?: string;
		notConsidered?: boolean;
		/* build */
		arch?: string;
		packages?: string[];
		subtype?: 'missing' | 'old';
		/* block */
		blocker?: string;
		/* bug */
		bugId?: string;
	}

	function parseInfo(line: string): ParsedInfo {
		// "Not touching package due to block request by X (...)"
		const blockReq = line.match(/^Not touching package due to block request by (\S+)/);
		if (blockReq) return { category: 'block', raw: line, blocker: blockReq[1] };

		// "Not touching package as requested in bug 1234567 on DATE"
		const bugBlock = line.match(/^Not touching package as requested in bug (\d+)/);
		if (bugBlock) return { category: 'bug', raw: line, bugId: bugBlock[1] };

		// "Depends: <source> <dep> [(not considered)]"
		if (line.startsWith('Depends: ')) {
			const parts = line.slice('Depends: '.length).split(' ');
			return {
				category: 'depends',
				raw: line,
				dep: parts[1] ?? '',
				notConsidered: line.includes('(not considered)')
			};
		}

		// "missing build on ARCH: pkg1, pkg2 (from VERSION)"
		const missingBuild = line.match(/^missing build on (\S+): (.+?)(?:\s+\(from .+\))?$/);
		if (missingBuild) {
			return {
				category: 'build',
				raw: line,
				subtype: 'missing',
				arch: missingBuild[1],
				packages: missingBuild[2].split(', ')
			};
		}

		// "old binaries left on ARCH: pkg1, pkg2 (from VERSION)"
		const oldBin = line.match(/^old binaries left on (\S+): (.+?)(?:\s+\(from .+\))?$/);
		if (oldBin) {
			return {
				category: 'build',
				raw: line,
				subtype: 'old',
				arch: oldBin[1],
				packages: oldBin[2].split(', ')
			};
		}

		if (line.includes('autopkgtest')) return { category: 'autopkgtest', raw: line };

		if (line.includes('is not a candidate') || line.includes('has no binaries')) {
			return { category: 'candidate', raw: line };
		}

		return { category: 'other', raw: line };
	}

	const INFO_LABELS: Record<InfoCategory, string> = {
		candidate: 'Candidate status',
		block: 'Block requests',
		bug: 'Bug holds',
		depends: 'Dependency issues',
		build: 'Build issues',
		autopkgtest: 'Autopkgtest',
		other: 'Other'
	};

	const INFO_ORDER: InfoCategory[] = ['candidate', 'block', 'bug', 'depends', 'build', 'autopkgtest', 'other'];

	const groupedInfo = $derived.by(() => {
		if (!pkg.excuse.info?.length) return [];
		const groups = new Map<InfoCategory, ParsedInfo[]>();
		for (const line of pkg.excuse.info) {
			const parsed = parseInfo(line);
			if (!groups.has(parsed.category)) groups.set(parsed.category, []);
			groups.get(parsed.category)!.push(parsed);
		}
		return INFO_ORDER.filter((cat) => groups.has(cat)).map((cat) => ({
			category: cat,
			label: INFO_LABELS[cat],
			items: groups.get(cat)!
		}));
	});
</script>

<svelte:head>
	<title>{pkg.source_package} – Ubuntu Excuses Explorer</title>
</svelte:head>

<section class="p-strip u-no-padding--bottom">
	<div class="row">
		<div class="col-12">
			<p>
				<a href={backHref}>{backLabel}</a>
			</p>
			<h1 class="p-heading--2">{pkg.source_package}</h1>
			<PolicyTable policyInfo={pkg.policy_info} horizontal />
			{#if data.hasAutopkgtest}
				<p class="u-no-margin--top">
					<a href="/sources/{encodeURIComponent(pkg.source_package)}/autopkgtest">
						View autopkgtest results →
					</a>
				</p>
			{/if}
		</div>
	</div>
</section>

<section class="p-strip u-no-padding--top">
	<div class="row">
		<!-- Overview -->
		<div class="col-6">
			<h2 class="p-heading--4">Overview</h2>
			<table class="p-table--mobile-card" aria-label="Package overview">
				<tbody>
					<tr>
						<th>Component</th>
						<td>{pkg.component}</td>
					</tr>
					<tr>
						<th>Maintainer</th>
						<td>{pkg.maintainer}</td>
					</tr>
					{#if pkg.team}
						<tr>
							<th>Team</th>
							<td>
								<a
									href="https://launchpad.net/~{encodeURIComponent(pkg.team)}"
									target="_blank"
									rel="noopener noreferrer"
								>{pkg.team}</a>
							</td>
						</tr>
					{/if}
					<tr>
						<th>Version</th>
						<td>
							<a
								href="https://launchpad.net/ubuntu/+source/{encodeURIComponent(pkg.source_package)}/{encodeURIComponent(pkg.old_version)}"
								target="_blank"
								rel="noopener noreferrer"
							>{pkg.old_version}</a>
							→
							<a
								href="https://launchpad.net/ubuntu/+source/{encodeURIComponent(pkg.source_package)}/{encodeURIComponent(pkg.new_version)}"
								target="_blank"
								rel="noopener noreferrer"
							>{pkg.new_version}</a>
						</td>
					</tr>
					<tr>
						<th>Candidate</th>
						<td>{pkg.is_candidate ? 'Yes' : 'No'}</td>
					</tr>
					<tr>
						<th>Verdict</th>
						<td><VerdictBadge verdict={pkg.verdict} /></td>
					</tr>
					<tr>
						<th>Migration status</th>
						<td><VerdictBadge verdict={pkg.migration_status} /></td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- Excuse -->
		<div class="col-6">
			<h2 class="p-heading--4">Excuse</h2>
			<p>
				<strong>Status:</strong>
				<VerdictBadge verdict={pkg.excuse.status} />
			</p>
			{#if pkg.excuse.detail}
				<p class="excuse-detail">{pkg.excuse.detail}</p>
			{/if}
			{#if groupedInfo.length > 0}
				<div class="excuse-groups">
					{#each groupedInfo as group}
						<div class="excuse-group">
							<h3 class="excuse-group__label">{group.label}</h3>
							<ul class="excuse-group__list">
								{#each group.items as item}
									<li class="excuse-group__item">
										{#if item.category === 'depends'}
											<a href="/sources/{encodeURIComponent(item.dep ?? '')}">{item.dep}</a>
											{#if item.notConsidered}
												<span class="excuse-tag">not considered</span>
											{/if}
										{:else if item.category === 'build'}
											<span class="excuse-arch">{item.arch}</span>
											<span class="excuse-subtype">{item.subtype === 'missing' ? 'missing build' : 'old binaries'}</span>
											<span class="excuse-pkgs">{item.packages?.join(', ')}</span>
										{:else if item.category === 'block'}
											Blocked by <code class="excuse-code">{item.blocker}</code>
										{:else if item.category === 'bug'}
											Bug hold —
											<a
												href="https://launchpad.net/bugs/{item.bugId}"
												target="_blank"
												rel="noopener noreferrer"
											>bug #{item.bugId}</a>
										{:else}
											{item.raw}
										{/if}
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</div>
			{:else if pkg.excuse.info && pkg.excuse.info.length > 0}
				<ul class="p-list">
					{#each pkg.excuse.info as line}
						<li class="p-list__item">{line}</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</section>

<!-- Dependencies -->
{#if pkg.dependencies}
	<section class="p-strip u-no-padding--top">
		<div class="row">
			<div class="col-12">
				<h2 class="p-heading--4">Dependencies</h2>
				{#if pkg.dependencies.blocked_by && pkg.dependencies.blocked_by.length > 0}
					<p><strong>Blocked by:</strong></p>
					<ul class="p-list">
						{#each pkg.dependencies.blocked_by as dep}
							<li class="p-list__item">
								<a href="/sources/{encodeURIComponent(dep)}">{dep}</a>
							</li>
						{/each}
					</ul>
				{/if}
				{#if pkg.dependencies.migrate_after && pkg.dependencies.migrate_after.length > 0}
					<p><strong>Migrate after:</strong></p>
					<ul class="p-list">
						{#each pkg.dependencies.migrate_after as dep}
							<li class="p-list__item">
								<a href="/sources/{encodeURIComponent(dep)}">{dep}</a>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	</section>
{/if}

<!-- Hints -->
{#if pkg.hints && pkg.hints.length > 0}
	<section class="p-strip u-no-padding--top">
		<div class="row">
			<div class="col-12">
				<h2 class="p-heading--4">Hints</h2>
				<table aria-label="Migration hints">
					<thead>
						<tr>
							<th>From</th>
							<th>Type</th>
						</tr>
					</thead>
					<tbody>
						{#each pkg.hints as hint}
							<tr>
								<td>{hint.from}</td>
								<td>{hint.type}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>
{/if}

<style lang="scss">
	.excuse-detail {
		color: #666;
		font-style: italic;
	}

	.excuse-groups {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.excuse-group__label {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #666;
		margin: 0 0 0.25rem;
	}

	.excuse-group__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.excuse-group__item {
		font-size: 0.875rem;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.3rem;
	}

	.excuse-arch {
		font-size: 0.7rem;
		font-weight: 600;
		background: #e5e5e5;
		border-radius: 2px;
		padding: 0.1em 0.4em;
		font-family: monospace;
		white-space: nowrap;
	}

	.excuse-subtype {
		color: #666;
		font-size: 0.8rem;
		white-space: nowrap;
	}

	.excuse-pkgs {
		font-family: monospace;
		font-size: 0.8rem;
		color: #333;
		word-break: break-word;
	}

	.excuse-tag {
		font-size: 0.7rem;
		background: #f5c6cb;
		color: #721c24;
		border-radius: 2px;
		padding: 0.1em 0.4em;
		white-space: nowrap;
	}

	.excuse-code {
		font-size: 0.85em;
		background: #f0f0f0;
		padding: 0.1em 0.35em;
		border-radius: 2px;
	}
</style>
