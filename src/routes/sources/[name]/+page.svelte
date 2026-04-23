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
					<tr>
						<th>Version</th>
						<td>{pkg.old_version} → {pkg.new_version}</td>
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
				<p>{pkg.excuse.detail}</p>
			{/if}
			{#if pkg.excuse.info && pkg.excuse.info.length > 0}
				<ul class="p-list">
					{#each pkg.excuse.info as line}
						<li class="p-list__item">{line}</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</section>

<!-- Policy verdicts -->
<section class="p-strip u-no-padding--top">
	<div class="row">
		<div class="col-12">
			<h2 class="p-heading--4">Policy verdicts</h2>
			<PolicyTable policyInfo={pkg.policy_info} />
			{#if data.hasAutopkgtest}
				<p>
					<a href="/sources/{encodeURIComponent(pkg.source_package)}/autopkgtest">
						View autopkgtest results →
					</a>
				</p>
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
