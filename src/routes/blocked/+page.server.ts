import type { PageServerLoad } from './$types.js';
import { getBlocked } from '$lib/server/api.js';

export const load: PageServerLoad = async ({ url, setHeaders }) => {
	setHeaders({ 'cache-control': 'public, max-age=300, stale-while-revalidate=3600' });
	const offset = Number(url.searchParams.get('offset') ?? '0');
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const sort = url.searchParams.get('sort') ?? 'age';
	const order = url.searchParams.get('order') ?? 'asc';
	const expandAll = url.searchParams.get('expanded') === '1';

	const blocked = await getBlocked({ offset, limit, sort, order });
	return { blocked, expandAll };
};
