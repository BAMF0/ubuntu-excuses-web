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

	const res = await fetch(url, {
		headers: { Accept: 'application/json' }
	});

	if (!res.ok) {
		const body = await res.text();
		throw new Error(`API ${res.status}: ${body}`);
	}

	return res.json() as Promise<T>;
}

export function getMeta(): Promise<Meta> {
	return apiFetch<Meta>('/meta');
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
