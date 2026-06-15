"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ignoreJob, markJobApplied } from "@/app/dashboard/actions";
import { JobFilters } from "@/components/JobFilters";
import { JobTable } from "@/components/JobTable";
import { SignOutButton } from "@/components/SignOutButton";
import { StatsCards } from "@/components/StatsCards";
import {
  computeJobStats,
  filterJobs,
  filtersToSearchParams,
  type Job,
  type JobFilters as JobFiltersState,
} from "@/types/job";

interface DashboardClientProps {
  initialJobs: Job[];
  initialFilters: JobFiltersState;
}

export function DashboardClient({
  initialJobs,
  initialFilters,
}: DashboardClientProps) {
  const router = useRouter();
  const [jobs, setJobs] = useState(initialJobs);
  const [filters, setFilters] = useState<JobFiltersState>(initialFilters);
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const stats = useMemo(() => computeJobStats(jobs), [jobs]);
  const filteredJobs = useMemo(() => filterJobs(jobs, filters), [jobs, filters]);

  const syncFiltersToUrl = useCallback(
    (nextFilters: JobFiltersState) => {
      const params = filtersToSearchParams(nextFilters);
      const query = params.toString();
      router.replace(query ? `/dashboard?${query}` : "/dashboard", {
        scroll: false,
      });
    },
    [router],
  );

  const handleFiltersChange = (nextFilters: JobFiltersState) => {
    setFilters(nextFilters);
    syncFiltersToUrl(nextFilters);
  };

  const handleApply = (job: Job) => {
    window.open(job.apply_url, "_blank", "noopener,noreferrer");
  };

  const updateJobStatus = async (
    job: Job,
    action: typeof markJobApplied | typeof ignoreJob,
    optimisticStatus: Job["status"],
    successMessage: string,
  ) => {
    setPendingJobId(job.id);

    const previousJobs = jobs;
    const appliedAt = optimisticStatus === "applied" ? new Date().toISOString() : null;

    setJobs((current) =>
      current.map((item) =>
        item.id === job.id
          ? { ...item, status: optimisticStatus, applied_at: appliedAt }
          : item,
      ),
    );

    try {
      const result = await action(job.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      setJobs((current) =>
        current.map((item) =>
          item.id === job.id
            ? {
                ...item,
                status: result.job.status,
                applied_at: result.job.applied_at,
              }
            : item,
        ),
      );

      toast.success(successMessage);
    } catch {
      setJobs(previousJobs);
      toast.error("Failed to update status.");
    } finally {
      setPendingJobId(null);
    }
  };

  const handleMarkApplied = (job: Job) => {
    startTransition(() => {
      void updateJobStatus(
        job,
        markJobApplied,
        "applied",
        "Application marked successfully.",
      );
    });
  };

  const handleIgnore = (job: Job) => {
    startTransition(() => {
      void updateJobStatus(job, ignoreJob, "ignored", "Job ignored.");
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Job Radar</h1>
          <p className="text-sm text-muted-foreground">
            Manage discovered frontend roles in one place.
          </p>
        </div>
        <SignOutButton />
      </div>

      <StatsCards stats={stats} />

      <JobFilters filters={filters} onFiltersChange={handleFiltersChange} />

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </p>
      </div>

      <JobTable
        jobs={filteredJobs}
        onApply={handleApply}
        onMarkApplied={handleMarkApplied}
        onIgnore={handleIgnore}
        pendingJobId={pendingJobId}
      />
    </div>
  );
}
