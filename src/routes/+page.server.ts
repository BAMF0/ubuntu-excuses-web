import type { PageServerLoad } from './$types.js';
import { getMeta } from '$lib/server/api.js';

export const load: PageServerLoad = async () => {
	const meta = await getMeta();
	return { meta };
};
