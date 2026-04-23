<script lang="ts">
	interface Props {
		verdict: string;
	}

	const { verdict }: Props = $props();

	const statusClass = $derived.by(() => {
		const v = verdict.toUpperCase();
		if (v === 'PASS' || v === 'WILL_ATTEMPT') return 'p-status-label--positive';
		if (v.startsWith('REJECTED') || v === 'BLOCKED') return 'p-status-label--negative';
		if (v === 'WAITING' || v.includes('TEMPORARY')) return 'p-status-label--caution';
		return '';
	});

	const label = $derived(verdict.replaceAll('_', ' '));
</script>

<span class="p-status-label {statusClass}">{label}</span>
