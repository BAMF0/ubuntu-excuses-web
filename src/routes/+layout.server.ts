import type { LayoutServerLoad } from './$types.js';
import { getMeta } from '$lib/server/api.js';

export const load: LayoutServerLoad = async () => {
	const meta = await getMeta();
	return { meta };
};
