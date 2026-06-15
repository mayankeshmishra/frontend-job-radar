"use client";

import { Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Job, JobStatus } from "@/types/job";

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  try {
    return format(parseISO(value), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

function statusVariant(status: JobStatus): "default" | "secondary" | "outline" {
  switch (status) {
    case "applied":
      return "default";
    case "ignored":
      return "outline";
    default:
      return "secondary";
  }
}

function formatStatus(status: JobStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatSource(source: string): string {
  return source.charAt(0).toUpperCase() + source.slice(1);
}

interface JobActionsProps {
  job: Job;
  onApply: (job: Job) => void;
  onMarkApplied: (job: Job) => void;
  onIgnore: (job: Job) => void;
  pendingJobId: string | null;
}

export function JobActions({
  job,
  onApply,
  onMarkApplied,
  onIgnore,
  pendingJobId,
}: JobActionsProps) {
  const isPending = pendingJobId === job.id;

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => onApply(job)}
      >
        Apply
      </Button>
      <Button
        size="sm"
        variant="secondary"
        disabled={isPending || job.status === "applied"}
        onClick={() => onMarkApplied(job)}
      >
        {isPending ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            Saving...
          </>
        ) : (
          "Mark Applied"
        )}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={isPending || job.status === "ignored"}
        onClick={() => onIgnore(job)}
      >
        {isPending ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            Saving...
          </>
        ) : (
          "Ignore"
        )}
      </Button>
    </div>
  );
}

interface JobStatusBadgeProps {
  status: JobStatus;
}

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  return <Badge variant={statusVariant(status)}>{formatStatus(status)}</Badge>;
}

export function JobMeta({ job }: { job: Job }) {
  return (
    <div className="space-y-1 text-sm text-muted-foreground">
      <p>{job.location ?? "Remote / unspecified"}</p>
      <p>{formatSource(job.source)}</p>
      <p>Posted {formatDate(job.posted_at)}</p>
    </div>
  );
}

export { formatDate, formatSource, formatStatus };
