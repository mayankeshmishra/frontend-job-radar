"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { JobStatus } from "@/types/job";

export interface JobStatusUpdate {
  id: string;
  status: JobStatus;
  applied_at: string | null;
}

export type UpdateJobStatusResult =
  | { success: true; job: JobStatusUpdate }
  | { success: false; error: string };

export async function markJobApplied(jobId: string): Promise<UpdateJobStatusResult> {
  await requireUser();

  const supabase = await createClient();
  const appliedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("jobs")
    .update({ status: "applied", applied_at: appliedAt })
    .eq("id", jobId)
    .select("id, status, applied_at")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true, job: data as JobStatusUpdate };
}

export async function ignoreJob(jobId: string): Promise<UpdateJobStatusResult> {
  await requireUser();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .update({ status: "ignored", applied_at: null })
    .eq("id", jobId)
    .select("id, status, applied_at")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true, job: data as JobStatusUpdate };
}
