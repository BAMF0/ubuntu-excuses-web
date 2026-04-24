<script lang="ts">
	import type { PolicyInfo } from '$lib/types.js';
	import VerdictBadge from './VerdictBadge.svelte';

	interface Props {
		policyInfo: PolicyInfo;
		horizontal?: boolean;
	}

	const { policyInfo, horizontal = false }: Props = $props();

	interface PolicyRow {
		name: string;
		verdict: string;
		detail?: string;
	}

	const rows: PolicyRow[] = $derived.by(() => {
		const r: PolicyRow[] = [];

		if (policyInfo.age) {
			r.push({
				name: 'Age',
				verdict: policyInfo.age.verdict,
				detail: `${policyInfo.age.current_age.toFixed(1)} / ${policyInfo.age.age_requirement} days`
			});
		}
		if (policyInfo.autopkgtest) {
			r.push({ name: 'Autopkgtest', verdict: policyInfo.autopkgtest.verdict });
		}
		if (policyInfo.block) {
			r.push({ name: 'Block', verdict: policyInfo.block });
		}
		if (policyInfo.block_bugs) {
			r.push({ name: 'Block bugs', verdict: policyInfo.block_bugs });
		}
		if (policyInfo.depends) {
			r.push({ name: 'Depends', verdict: policyInfo.depends });
		}
		if (policyInfo.email) {
			r.push({ name: 'Email', verdict: policyInfo.email });
		}
		if (policyInfo.linux) {
			r.push({ name: 'Linux', verdict: policyInfo.linux });
		}
		if (policyInfo.rc_bugs) {
			r.push({ name: 'RC bugs', verdict: policyInfo.rc_bugs.verdict });
		}
		if (policyInfo.source_ppa) {
			r.push({ name: 'Source PPA', verdict: policyInfo.source_ppa });
		}
		if (policyInfo.update_excuse) {
			r.push({ name: 'Update excuse', verdict: policyInfo.update_excuse.verdict });
		}

		return r;
	});
</script>

{#if horizontal}
	<div class="policy-strip" role="list" aria-label="Policy verdicts">
		{#each rows as row}
			<div class="policy-chip" role="listitem">
				<span class="policy-chip__name">{row.name}</span>
				<VerdictBadge verdict={row.verdict} />
				{#if row.detail}
					<span class="policy-chip__detail">{row.detail}</span>
				{/if}
			</div>
		{/each}
	</div>
{:else}
	<table aria-label="Policy verdicts">
		<thead>
			<tr>
				<th>Policy</th>
				<th>Verdict</th>
				<th>Detail</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row}
				<tr>
					<td>{row.name}</td>
					<td><VerdictBadge verdict={row.verdict} /></td>
					<td>{row.detail ?? ''}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<style lang="scss">
	.policy-strip {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1.5rem;
		align-items: flex-start;
		padding: 0.75rem 0 0.25rem;
		border-top: 1px solid #e5e5e5;
	}

	.policy-chip {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.2rem;
	}

	.policy-chip__name {
		font-size: 0.7rem;
		color: #666;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 500;
	}

	.policy-chip__detail {
		font-size: 0.7rem;
		color: #999;
	}
</style>
