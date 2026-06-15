import axios from "axios";
import { z } from "zod";
import type { Job } from "../types/job";
import { logger } from "../utils/logger";

const greenhouseJobSchema = z.object({
  id: z.number(),
  title: z.string(),
  absolute_url: z.string(),
  updated_at: z.string().optional(),
  content: z.string().optional(),
  location: z
    .object({
      name: z.string().optional(),
    })
    .optional(),
});

const greenhouseResponseSchema = z.object({
  jobs: z.array(greenhouseJobSchema),
});

/**
 * Fetches and normalizes job postings from a Greenhouse board.
 */
export async function fetchGreenhouseJobs(company: string): Promise<Job[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${company}/jobs`;

  try {
    const response = await axios.get<unknown>(url, { timeout: 30_000 });
    const parsed = greenhouseResponseSchema.parse(response.data);

    return parsed.jobs.map((job) => ({
      source: "greenhouse",
      externalId: String(job.id),
      title: job.title,
      company,
      location: job.location?.name,
      applyUrl: job.absolute_url,
      postedAt: job.updated_at,
      description: job.content,
    }));
  } catch (error) {
    logger.error({ err: error, company, source: "greenhouse" }, "Failed to fetch Greenhouse jobs");
    return [];
  }
}
