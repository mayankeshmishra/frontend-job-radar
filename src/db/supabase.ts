import type { Env } from "../config/env";
import type { Job, JobRecord } from "../types/job";
import { logger } from "../utils/logger";
import { getClient } from "./client";

/**
 * Checks whether a job already exists in the database.
 */
export async function jobExists(env: Env, source: string, externalId: string): Promise<boolean> {
  const client = getClient(env);

  const { data, error } = await client
    .from("jobs")
    .select("id")
    .eq("source", source)
    .eq("external_id", externalId)
    .maybeSingle();

  if (error) {
    logger.error({ err: error, source, externalId }, "Failed to check if job exists");
    throw error;
  }

  return data !== null;
}

/**
 * Persists a new job record to Supabase.
 */
export async function saveJob(env: Env, job: Job): Promise<JobRecord> {
  const client = getClient(env);

  const row = {
    source: job.source,
    external_id: job.externalId,
    title: job.title,
    company: job.company,
    location: job.location ?? null,
    apply_url: job.applyUrl,
    posted_at: job.postedAt ?? null,
    description: job.description ?? null,
    discovered_at: new Date().toISOString(),
  };

  const { data, error } = await client.from("jobs").insert(row).select().single();

  if (error) {
    const schemaHint =
      error.code === "PGRST204"
        ? "Run supabase/migrations/001_create_jobs.sql or 002_add_description_column.sql in the Supabase SQL Editor."
        : undefined;
    logger.error({ err: error, job, schemaHint }, "Failed to save job");
    throw error;
  }

  return data as JobRecord;
}

/**
 * Returns all stored jobs ordered by discovery time.
 */
export async function getJobs(env: Env): Promise<JobRecord[]> {
  const client = getClient(env);

  const { data, error } = await client
    .from("jobs")
    .select("*")
    .order("discovered_at", { ascending: false });

  if (error) {
    logger.error({ err: error }, "Failed to fetch jobs");
    throw error;
  }

  return (data ?? []) as JobRecord[];
}
