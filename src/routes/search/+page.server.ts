import { redirect } from '@sveltejs/kit';
import { getSources } from '$lib/server/api.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ url, setHeaders }) => {
	setHeaders({ 'cache-control': 'public, max-age=300, stale-while-revalidate=3600' });
	const q = url.searchParams.get('q') ?? '';
	const depends = url.searchParams.get('depends') ?? '';
	const sort = url.searchParams.get('sort') ?? 'name';
	const order = url.searchParams.get('order') ?? 'asc';
	const offset = Number(url.searchParams.get('offset') ?? 0);
	const limit = Number(url.searchParams.get('limit') ?? 50);

	const sources = await getSources({
		search: q || undefined,
		depends: depends || undefined,
		sort,
		order,
		offset,
		limit
	});

	// Single result: jump straight to the package detail page.
	if (sources.total === 1 && sources.sources.length === 1) {
		const name = sources.sources[0].source_package;
		redirect(302, `/sources/${encodeURIComponent(name)}?from=search`);
	}

	return { sources, q, depends };
};
