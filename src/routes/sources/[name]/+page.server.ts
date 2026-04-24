import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';
import { getSource } from '$lib/server/api.js';

export const load: PageServerLoad = async ({ params, url, setHeaders }) => {
	setHeaders({ 'cache-control': 'public, max-age=300, stale-while-revalidate=3600' });
	try {
		const source = await getSource(params.name);
		const autopkgtest = source.policy_info?.autopkgtest ?? {};
		const hasAutopkgtest = Object.keys(autopkgtest).some((k) => k !== 'verdict');
		const from = url.searchParams.get('from');
		const backUrl = url.searchParams.get('backUrl');
		return { source, hasAutopkgtest, from, backUrl };
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		if (msg.includes('404')) {
			error(404, `Package not found: ${params.name}`);
		}
		throw e;
	}
};
