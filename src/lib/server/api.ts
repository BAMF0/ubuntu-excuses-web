/**
 * Server-side API client for the ubuntu-excuses-data service.
 *
 * The base URL defaults to http://localhost:8080 and can be overridden
 * with the EXCUSES_API_URL environment variable.
 */
import { env } from '$env/dynamic/private';
import type {
	Meta,
	SourcesResponse,
	Source,
	AutopkgtestResponse,
	BlockedResponse
} from '$lib/types.js';

function getBaseUrl(): string {
	return env.EXCUSES_API_URL ?? 'http://localhost:8080';
}

// In-flight request deduplication: if two callers request the same URL
// concurrently, they share a single fetch instead of making two.
const inFlight = new Map<string, Promise<unknown>>();

async function apiFetch<T>(path: string, params?: Record<string, string | string[]>): Promise<T> {
	const url = new URL(path, getBaseUrl());
	if (params) {
		for (const [k, v] of Object.entries(params)) {
			if (Array.isArray(v)) {
				for (const item of v) url.searchParams.append(k, item);
			} else if (v !== undefined && v !== '') {
				url.searchParams.set(k, v);
			}
		}
	}

	const key = url.toString();

	if (inFlight.has(key)) {
		return inFlight.get(key) as Promise<T>;
	}

	const promise = (async () => {
		const res = await fetch(url, {
			headers: { Accept: 'application/json' }
		});

		if (!res.ok) {
			const body = await res.text();
			throw new Error(`API ${res.status}: ${body}`);
		}

		return res.json() as T;
	})();

	inFlight.set(key, promise);
	promise.finally(() => inFlight.delete(key));

	return promise;
}

// TTL cache for /meta — this endpoint changes at most once per excuses run
// (typically every few hours), so caching it server-side avoids a round-trip
// on every incoming request.
const META_TTL_MS = 5 * 60 * 1000; // 5 minutes
let metaCached: Meta | null = null;
let metaExpiresAt = 0;

export async function getMeta(): Promise<Meta> {
	if (metaCached && Date.now() < metaExpiresAt) {
		return metaCached;
	}
	metaCached = await apiFetch<Meta>('/meta');
	metaExpiresAt = Date.now() + META_TTL_MS;
	return metaCached;
}

export interface SourcesParams {
	offset?: number;
	limit?: number;
	sort?: string;
	order?: string;
	component?: string;
	verdict?: string;
	maintainer?: string;
	status?: string;
	search?: string;
	depends?: string;
}

export function getSources(params?: SourcesParams): Promise<SourcesResponse> {
	const query: Record<string, string> = {};
	if (params) {
		for (const [k, v] of Object.entries(params)) {
			if (v !== undefined && v !== null) query[k] = String(v);
		}
	}
	return apiFetch<SourcesResponse>('/sources', query);
}

export function getSource(name: string): Promise<Source> {
	return apiFetch<Source>(`/sources/${encodeURIComponent(name)}`);
}

export function getAutopkgtest(name: string): Promise<AutopkgtestResponse> {
	return apiFetch<AutopkgtestResponse>(`/sources/${encodeURIComponent(name)}/autopkgtest`);
}

export interface BlockedParams {
	offset?: number;
	limit?: number;
	sort?: string;
	order?: string;
	teams?: string[];
}

export function getBlocked(params?: BlockedParams): Promise<BlockedResponse> {
	const query: Record<string, string | string[]> = {};
	if (params) {
		if (params.offset !== undefined) query.offset = String(params.offset);
		if (params.limit !== undefined) query.limit = String(params.limit);
		if (params.sort) query.sort = params.sort;
		if (params.order) query.order = params.order;
		if (params.teams?.length) query.team = params.teams;
	}
	return apiFetch<BlockedResponse>('/blocked', query);
}
