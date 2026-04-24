import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';
import { getAutopkgtest } from '$lib/server/api.js';

export const load: PageServerLoad = async ({ params, url }) => {
	try {
		const autopkgtest = await getAutopkgtest(params.name);
		return { name: params.name, autopkgtest, from: url.searchParams.get('from') };
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		if (msg.includes('404')) {
			error(404, `Package not found: ${params.name}`);
		}
		throw e;
	}
};
