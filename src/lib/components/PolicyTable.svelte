<script lang="ts">
	import type { PolicyInfo } from '$lib/types.js';
	import VerdictBadge from './VerdictBadge.svelte';

	interface Props {
		policyInfo: PolicyInfo;
	}

	const { policyInfo }: Props = $props();

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
