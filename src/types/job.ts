/**
 * Normalized job posting shared across all collectors.
 */
export interface Job {
  source: string;
  externalId: string;
  title: string;
  company: string;
  location?: string;
  applyUrl: string;
  postedAt?: string;
  description?: string;
}

/**
 * Database row shape for the jobs table.
 */
export interface JobRecord {
  id: string;
  source: string;
  external_id: string;
  title: string;
  company: string;
  location: string | null;
  apply_url: string;
  posted_at: string | null;
  description: string | null;
  discovered_at: string;
  status?: "new" | "applied" | "ignored";
  applied_at?: string | null;
}
