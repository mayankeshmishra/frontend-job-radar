"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  JobActions,
  JobMeta,
  JobStatusBadge,
  formatDate,
  formatSource,
} from "@/components/JobActions";
import type { Job } from "@/types/job";

interface JobTableProps {
  jobs: Job[];
  onApply: (job: Job) => void;
  onMarkApplied: (job: Job) => void;
  onIgnore: (job: Job) => void;
  pendingJobId: string | null;
}

export function JobTable({
  jobs,
  onApply,
  onMarkApplied,
  onIgnore,
  pendingJobId,
}: JobTableProps) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
        No jobs found
      </div>
    );
  }

  return (
    <>
      <div className="hidden rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Posted Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.company}</TableCell>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.location ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{formatSource(job.source)}</Badge>
                </TableCell>
                <TableCell>{formatDate(job.posted_at)}</TableCell>
                <TableCell>
                  <JobStatusBadge status={job.status} />
                </TableCell>
                <TableCell className="text-right">
                  <JobActions
                    job={job}
                    onApply={onApply}
                    onMarkApplied={onMarkApplied}
                    onIgnore={onIgnore}
                    pendingJobId={pendingJobId}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-4 md:hidden">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader className="gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-base">{job.title}</CardTitle>
                  <p className="text-sm font-medium text-muted-foreground">
                    {job.company}
                  </p>
                </div>
                <JobStatusBadge status={job.status} />
              </div>
              <JobMeta job={job} />
            </CardHeader>
            <CardContent>
              <JobActions
                job={job}
                onApply={onApply}
                onMarkApplied={onMarkApplied}
                onIgnore={onIgnore}
                pendingJobId={pendingJobId}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
