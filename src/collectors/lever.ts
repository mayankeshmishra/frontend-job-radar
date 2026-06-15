import axios from "axios";
import { z } from "zod";
import type { Job } from "../types/job";
import { logger } from "../utils/logger";

const leverJobSchema = z.object({
  id: z.string(),
  text: z.string(),
  hostedUrl: z.string(),
  createdAt: z.number().optional(),
  descriptionPlain: z.string().optional(),
  categories: z
    .object({
      location: z.string().optional(),
      team: z.string().optional(),
    })
    .optional(),
});

const leverResponseSchema = z.array(leverJobSchema);

/**
 * Fetches and normalizes job postings from a Lever board.
 */
export async function fetchLeverJobs(company: string): Promise<Job[]> {
  const url = `https://api.lever.co/v0/postings/${company}`;

  try {
    const response = await axios.get<unknown>(url, { timeout: 30_000 });
    const parsed = leverResponseSchema.parse(response.data);

    return parsed.map((job) => ({
      source: "lever",
      externalId: job.id,
      title: job.text,
      company,
      location: job.categories?.location,
      applyUrl: job.hostedUrl,
      postedAt: job.createdAt ? new Date(job.createdAt).toISOString() : undefined,
      description: job.descriptionPlain,
    }));
  } catch (error) {
    logger.error({ err: error, company, source: "lever" }, "Failed to fetch Lever jobs");
    return [];
  }
}
