import type { Env } from "../config/env";
import { jobExists, saveJob } from "../db/supabase";
import { matchesJob } from "../filters/matcher";
import { sendEmailAlert } from "../notifications/email";
import { sendTelegramAlert } from "../notifications/telegram";
import type { Job } from "../types/job";
import { logger } from "../utils/logger";

export interface ProcessSummary {
  matched: number;
  saved: number;
  notificationsSent: number;
  skipped: number;
  errors: number;
}

/**
 * Filters, deduplicates, persists, and notifies for a single job.
 */
export async function processJob(env: Env, job: Job, summary: ProcessSummary): Promise<void> {
  if (!matchesJob(job.title)) {
    summary.skipped += 1;
    return;
  }

  summary.matched += 1;

  try {
    const exists = await jobExists(env, job.source, job.externalId);
    if (exists) {
      summary.skipped += 1;
      return;
    }

    await saveJob(env, job);
    summary.saved += 1;

    await Promise.all([sendTelegramAlert(env, job), sendEmailAlert(env, job)]);
    summary.notificationsSent += 1;
  } catch (error) {
    summary.errors += 1;
    logger.error({ err: error, job }, "Failed to process job");
  }
}

/**
 * Processes a batch of jobs through the full pipeline.
 */
export async function processJobs(env: Env, jobs: Job[]): Promise<ProcessSummary> {
  const summary: ProcessSummary = {
    matched: 0,
    saved: 0,
    notificationsSent: 0,
    skipped: 0,
    errors: 0,
  };

  for (const job of jobs) {
    await processJob(env, job, summary);
  }

  return summary;
}
