import { DashboardClient } from "@/components/DashboardClient";
import { requireUser } from "@/lib/auth";
import { fetchJobs } from "@/lib/jobs";
import { parseJobFilters } from "@/types/job";

interface DashboardPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    source?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  await requireUser();

  const [jobs, params] = await Promise.all([fetchJobs(), searchParams]);
  const initialFilters = parseJobFilters(params);

  return <DashboardClient initialJobs={jobs} initialFilters={initialFilters} />;
}
