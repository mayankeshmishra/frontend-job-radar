import type { Job } from "../types/job";
import { logger } from "../utils/logger";

/**
 * Phase 2: LinkedIn job collection abstraction.
 * Scraping logic is intentionally not implemented.
 */
export async function fetchLinkedInJobs(): Promise<Job[]> {
  logger.warn({ source: "linkedin" }, "LinkedIn collector is not implemented (phase 2)");
  return [];
}
