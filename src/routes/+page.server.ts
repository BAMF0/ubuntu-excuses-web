import type { PageServerLoad } from './$types.js';
import { getSources } from '$lib/server/api.js';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({ 'cache-control': 'public, max-age=60, stale-while-revalidate=300' });
	const attempting = await getSources({ status: 'WILL_ATTEMPT', limit: 200, sort: 'name', order: 'asc' });
	return { attempting };
};
