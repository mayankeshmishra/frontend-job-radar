import type { Job, JobStatus } from "@/types/job";
import { compareJobsByDate } from "@/types/job";

import { createClient } from "@/lib/supabase/server";

interface JobRow {
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
  status: JobStatus | null;
  applied_at: string | null;
}

function normalizeJob(row: JobRow): Job {
  return {
    ...row,
    status: row.status ?? "new",
    applied_at: row.applied_at ?? null,
  };
}

export async function fetchJobs(): Promise<Job[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, source, external_id, title, company, location, apply_url, posted_at, description, discovered_at, status, applied_at",
    );

  if (error) {
    throw new Error(error.message);
  }

  return (data as JobRow[]).map(normalizeJob).sort(compareJobsByDate);
}
