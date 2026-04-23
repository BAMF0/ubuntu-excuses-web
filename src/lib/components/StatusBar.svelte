<script lang="ts">
	import type { Meta } from '$lib/types.js';

	interface Props {
		meta: Meta;
	}

	const { meta }: Props = $props();
	const formattedDate = $derived(
		new Date(meta.generated_date).toLocaleString('en-GB', {
			dateStyle: 'medium',
			timeStyle: 'short',
			timeZone: 'UTC'
		})
	);

	const statusEntries = $derived(
		Object.entries(meta.migration_status_counts ?? {}).sort(([a], [b]) => a.localeCompare(b))
	);
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
				{formattedDate} UTC
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
					<strong>{status}:</strong>
					{count.toLocaleString()}
				</span>
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
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
