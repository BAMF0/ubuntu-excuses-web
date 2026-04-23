import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';
import { getSource } from '$lib/server/api.js';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const source = await getSource(params.name);
		const autopkgtest = source.policy_info?.autopkgtest ?? {};
		const hasAutopkgtest = Object.keys(autopkgtest).some((k) => k !== 'verdict');
		return { source, hasAutopkgtest };
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		if (msg.includes('404')) {
			error(404, `Package not found: ${params.name}`);
		}
		throw e;
	}
};
