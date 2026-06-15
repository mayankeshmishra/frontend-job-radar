export type JobStatus = "new" | "applied" | "ignored";

export type JobSource = "greenhouse" | "lever" | "workday";

export type StatusFilter = JobStatus | "all";

export interface Job {
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
  status: JobStatus;
  applied_at: string | null;
}

export interface JobStats {
  total: number;
  new: number;
  applied: number;
  ignored: number;
}

export interface JobFilters {
  search: string;
  status: StatusFilter;
  source: JobSource | "all";
}

export const JOB_SOURCES: JobSource[] = ["greenhouse", "lever", "workday"];

export const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "applied", label: "Applied" },
  { value: "ignored", label: "Ignored" },
];

export function isJobSource(value: string): value is JobSource {
  return JOB_SOURCES.includes(value as JobSource);
}

export function isStatusFilter(value: string): value is StatusFilter {
  return STATUS_FILTER_OPTIONS.some((option) => option.value === value);
}

export const DEFAULT_FILTERS: JobFilters = {
  search: "",
  status: "all",
  source: "all",
};

export function parseJobFilters(searchParams: {
  search?: string;
  status?: string;
  source?: string;
}): JobFilters {
  return {
    search: searchParams.search ?? DEFAULT_FILTERS.search,
    status:
      searchParams.status && isStatusFilter(searchParams.status)
        ? searchParams.status
        : DEFAULT_FILTERS.status,
    source:
      searchParams.source === "all" || !searchParams.source
        ? "all"
        : isJobSource(searchParams.source)
          ? searchParams.source
          : DEFAULT_FILTERS.source,
  };
}

export function filtersToSearchParams(filters: JobFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.status !== DEFAULT_FILTERS.status) {
    params.set("status", filters.status);
  }

  if (filters.source !== DEFAULT_FILTERS.source) {
    params.set("source", filters.source);
  }

  return params;
}

export function compareJobsByDate(a: Job, b: Job): number {
  const aPosted = a.posted_at ? new Date(a.posted_at).getTime() : 0;
  const bPosted = b.posted_at ? new Date(b.posted_at).getTime() : 0;

  if (aPosted !== bPosted) {
    return bPosted - aPosted;
  }

  return new Date(b.discovered_at).getTime() - new Date(a.discovered_at).getTime();
}

export function computeJobStats(jobs: Job[]): JobStats {
  return jobs.reduce<JobStats>(
    (stats, job) => {
      stats.total += 1;
      stats[job.status] += 1;
      return stats;
    },
    { total: 0, new: 0, applied: 0, ignored: 0 },
  );
}

export function filterJobs(jobs: Job[], filters: JobFilters): Job[] {
  const search = filters.search.trim().toLowerCase();

  return jobs
    .filter((job) => {
      if (filters.status === "all" && job.status === "ignored") {
        return false;
      }

      if (filters.status !== "all" && job.status !== filters.status) {
        return false;
      }

      if (filters.source !== "all" && job.source !== filters.source) {
        return false;
      }

      if (!search) {
        return true;
      }

      return (
        job.company.toLowerCase().includes(search) ||
        job.title.toLowerCase().includes(search)
      );
    })
    .sort(compareJobsByDate);
}
