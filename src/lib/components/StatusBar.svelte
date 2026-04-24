<script lang="ts">
	import type { Meta } from '$lib/types.js';

	interface Props {
		meta: Meta;
	}

	const { meta }: Props = $props();
	const utcFormatted = new Date(meta.generated_date).toLocaleString('en-GB', {
		dateStyle: 'medium',
		timeStyle: 'short',
		timeZone: 'UTC'
	}) + ' UTC';

	let showUTC = $state(false);
	let formattedDate = $state(utcFormatted);

	$effect(() => {
		const saved = localStorage.getItem('statusBarShowUTC');
		if (saved !== null) showUTC = saved === 'true';
	});

	$effect(() => {
		formattedDate = showUTC
			? utcFormatted
			: new Date(meta.generated_date).toLocaleString(undefined, {
					dateStyle: 'medium',
					timeStyle: 'short',
					timeZoneName: 'short'
				});
	});

	function toggleTimezone() {
		showUTC = !showUTC;
		localStorage.setItem('statusBarShowUTC', String(showUTC));
	}

	const statusEntries = $derived(
		Object.entries(meta.migration_status_counts ?? {}).sort(([a], [b]) => a.localeCompare(b))
	);

	const statusLabels: Record<string, string> = {
		BLOCKED: 'Blocked',
		WILL_ATTEMPT: 'Will attempt',
		PASS: 'Pass',
		REJECTED: 'Rejected',
		WAITING: 'Waiting'
	};

	function formatStatus(status: string): string {
		return statusLabels[status] ?? status.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	}
</script>

<div class="p-status-bar">
	<div class="row">
		<div class="p-status-bar__items">
			<a href="/" class="p-status-bar__home" aria-label="Home">
				⌂ <span class="p-status-bar__home-label">Home</span>
			</a>
			<span class="p-status-bar__separator" aria-hidden="true"></span>
			<span class="p-status-bar__item">
				<strong>Generated:</strong>
				<button class="status-bar__date-toggle" onclick={toggleTimezone} title="Click to toggle UTC / local time">
					{formattedDate}
				</button>
			</span>
			<span class="p-status-bar__item">
				<strong>Sources:</strong>
				{meta.total_sources.toLocaleString()}
			</span>
			<span class="p-status-bar__item">
				<strong>Candidates:</strong>
				{meta.total_candidates.toLocaleString()}
			</span>
			{#each statusEntries as [status, count]}
				<span class="p-status-bar__item">
					<span class="p-status-bar__status-label p-status-bar__status--{status.toLowerCase()}">{formatStatus(status)}:</span>
					{count.toLocaleString()}
				</span>
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	.status-bar__date-toggle {
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		color: inherit;
		font: inherit;
		line-height: inherit;
		vertical-align: baseline;
		cursor: pointer;
		text-decoration: underline dotted;
		text-underline-offset: 2px;

		&:hover {
			color: #fff;
		}
	}

	.p-status-bar {
		background-color: #262626;
		color: #f7f7f7;
		padding: 0.35rem 1rem;
		font-size: 0.875rem;
	}

	.p-status-bar__items {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		align-items: center;
	}

	.p-status-bar__item strong {
		color: #999;
		font-weight: 400;
		margin-right: 0.25rem;
	}

	.p-status-bar__status-label {
		font-weight: 400;
		margin-right: 0.25rem;
	}

	.p-status-bar__status--blocked {
		color: #c7162b;
	}

	.p-status-bar__status--will_attempt {
		color: #0e8420;
	}

	.p-status-bar__status--pass {
		color: #0e8420;
	}

	.p-status-bar__status--rejected {
		color: #c7162b;
	}

	.p-status-bar__status--waiting {
		color: #f99b11;
	}

	.p-status-bar__home {
		color: #f7f7f7;
		text-decoration: none;
		font-weight: 600;
		white-space: nowrap;

		&:hover {
			color: #fff;
			text-decoration: underline;
		}
	}

	.p-status-bar__home-label {
		margin-left: 0.15rem;
	}

	.p-status-bar__separator {
		width: 1px;
		height: 1rem;
		background-color: #666;
	}
</style>
