/**
 * Server-side API client for the ubuntu-excuses-data service.
 *
 * The base URL defaults to http://localhost:8080 and can be overridden
 * with the EXCUSES_API_URL environment variable.
 */
import { env } from '$env/dynamic/private';
import type { Meta, SourcesResponse, Source, AutopkgtestResponse } from '$lib/types.js';

function getBaseUrl(): string {
	return env.EXCUSES_API_URL ?? 'http://localhost:8080';
}

async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
	const url = new URL(path, getBaseUrl());
	if (params) {
		for (const [k, v] of Object.entries(params)) {
			if (v !== undefined && v !== '') url.searchParams.set(k, v);
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
