/** Types mirroring the ubuntu-excuses-data API responses. */

// GET /meta
export interface Meta {
	generated_date: string;
	total_sources: number;
	total_candidates: number;
	migration_status_counts: Record<string, number>;
	components: string[];
	verdicts: string[];
	maintainers: string[];
	arches: string[];
	teams: string[];
	statuses: string[];
}

// GET /blocked (paginated list)
export interface BlockedResponse {
	generated_date: string;
	total: number;
	offset: number;
	limit: number;
	sort: string;
	order: string;
	sources: BlockedSource[];
}

export interface BlockedSource {
	source_package: string;
	team?: string;
	verdict: string;
	old_version: string;
	new_version: string;
	age: number;
	has_autopkgtest: boolean;
	excuse_detail?: string;
	dependencies?: Dependencies;
	hints?: Hint[];
}

// GET /sources (paginated list)
export interface SourcesResponse {
	generated_date: string;
	total: number;
	offset: number;
	limit: number;
	sort: string;
	order: string;
	sources: Source[];
}

// Individual source package
export interface Source {
	source_package: string;
	component: string;
	maintainer: string;
	verdict: string;
	migration_status: string;
	old_version: string;
	new_version: string;
	is_candidate: boolean;
	invalidated_by_other: boolean;
	item_name: string;
	excuse: Excuse;
	policy_info: PolicyInfo;
	dependencies?: Dependencies;
	hints?: Hint[];
	reason?: string[];
}

export interface Excuse {
	status: string;
	detail?: string;
	info?: string[];
}

export interface PolicyInfo {
	age: AgePolicy;
	autopkgtest?: AutopkgtestPolicy;
	block: string;
	block_bugs: string;
	depends: string;
	email: string;
	linux?: string;
	rc_bugs: RcBugsPolicy;
	source_ppa: string;
	update_excuse: UpdateExcusePolicy;
}

export interface AgePolicy {
	age_requirement: number;
	current_age: number;
	verdict: string;
}

export interface AutopkgtestPolicy {
	verdict: string;
	[key: string]: unknown;
}

export interface RcBugsPolicy {
	shared_bugs: number[];
	unique_source_bugs: number[];
	unique_target_bugs: number[];
	verdict: string;
}

export interface UpdateExcusePolicy {
	verdict: string;
	bugs?: Record<string, number>;
}

export interface Dependencies {
	blocked_by?: string[];
	blocks?: string[];
	migrate_after?: string[];
}

export interface Hint {
	from: string;
	type: string;
}

// GET /sources/{name}/autopkgtest
export interface AutopkgtestResult {
	status: string;
	log_url?: string;
	pkg_url?: string;
}

export interface AutopkgtestResponse {
	verdict: string;
	packages: Record<string, Record<string, AutopkgtestResult>>;
}
