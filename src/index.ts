import { loadDotenvFiles } from "./config/dotenv";

loadDotenvFiles();

import { fetchGreenhouseJobs } from "./collectors/greenhouse";
import { fetchLeverJobs } from "./collectors/lever";
import { fetchWorkdayJobs } from "./collectors/workday";
import { loadEnv } from "./config/env";
import { loadCompaniesConfig } from "./config/loader";
import { processJobs } from "./services/jobProcessor";
import { matchesJob } from "./filters/matcher";
import type { Job } from "./types/job";
import { logger } from "./utils/logger";

/**
 * Fetches jobs from all configured sources. Collectors fail independently.
 */
async function fetchAllJobs(): Promise<Job[]> {
  const companies = loadCompaniesConfig();
  const results: Job[][] = [];

  const greenhouseResults = await Promise.all(
    companies.greenhouse.map(async (company) => fetchGreenhouseJobs(company))
  );
  results.push(...greenhouseResults);

  const leverResults = await Promise.all(
    companies.lever.map(async (company) => fetchLeverJobs(company))
  );
  results.push(...leverResults);

  const workdayResults = await Promise.all(
    companies.workday.map(async (config) => fetchWorkdayJobs(config))
  );
  results.push(...workdayResults);

  return results.flat();
}

async function main(): Promise<void> {
  logger.info("Starting Frontend Job Radar monitor run");

  const env = loadEnv();
  const jobs = await fetchAllJobs();

  logger.info({ count: jobs.length }, "Jobs fetched");

  const summary = await processJobs(env, jobs);

  const matchedTitles = jobs
    .filter((job) => matchesJob(job.title))
    .slice(0, 10)
    .map((job) => `${job.title} @ ${job.company}`);

  if (matchedTitles.length > 0) {
    logger.info({ matchedTitles }, "Matched job titles (sample)");
  }

  logger.info(
    {
      fetched: jobs.length,
      matched: summary.matched,
      saved: summary.saved,
      notificationsSent: summary.notificationsSent,
      skipped: summary.skipped,
      errors: summary.errors,
    },
    "Monitor run complete"
  );
}

main().catch((error: unknown) => {
  logger.error({ err: error }, "Unhandled error in monitor run");
  process.exitCode = 1;
});
