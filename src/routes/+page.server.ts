import type { PageServerLoad } from './$types.js';
import { getSources } from '$lib/server/api.js';

export const load: PageServerLoad = async () => {
	const attempting = await getSources({ status: 'WILL_ATTEMPT', limit: 200, sort: 'name', order: 'asc' });
	return { attempting };
};
