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
</script>

<div class="p-status-bar">
	<div class="row">
		<div class="p-status-bar__items">
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
			<span class="p-status-bar__item">
				<strong>Components:</strong>
				{meta.components.length}
			</span>
			<span class="p-status-bar__item">
				<strong>Architectures:</strong>
				{meta.arches.length}
			</span>
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
</style>
