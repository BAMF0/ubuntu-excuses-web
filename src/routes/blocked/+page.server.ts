import type { PageServerLoad } from './$types.js';
import { getBlocked } from '$lib/server/api.js';

export const load: PageServerLoad = async ({ url }) => {
	const offset = Number(url.searchParams.get('offset') ?? '0');
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const sort = url.searchParams.get('sort') ?? 'age';
	const order = url.searchParams.get('order') ?? 'asc';
	const teams = url.searchParams.getAll('team');

	const blocked = await getBlocked({ offset, limit, sort, order, teams: teams.length ? teams : undefined });
	return { blocked, teams };
};
