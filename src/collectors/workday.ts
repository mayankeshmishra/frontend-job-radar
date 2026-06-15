import axios from "axios";
import { z } from "zod";
import type { WorkdayCompanyConfig } from "../config/loader";
import type { Job } from "../types/job";
import { logger } from "../utils/logger";

const workdayJobSchema = z.object({
  title: z.string(),
  externalPath: z.string(),
  locationsText: z.string().optional(),
  postedOn: z.string().optional(),
  bulletFields: z.array(z.string()).optional(),
});

const workdayResponseSchema = z.object({
  jobPostings: z.array(workdayJobSchema),
});

export interface WorkdayFetchOptions {
  limit?: number;
  searchText?: string;
}

/**
 * Builds the Workday CXS jobs API URL for a company configuration.
 */
export function buildWorkdayJobsUrl(config: WorkdayCompanyConfig): string {
  return `https://${config.tenant}.${config.instance}.myworkdayjobs.com/wday/cxs/${config.tenant}/${config.site}/jobs`;
}

/**
 * Builds the public apply URL from a Workday external path.
 */
export function buildWorkdayApplyUrl(config: WorkdayCompanyConfig, externalPath: string): string {
  const baseUrl = `https://${config.tenant}.${config.instance}.myworkdayjobs.com`;
  return `${baseUrl}${externalPath}`;
}

/**
 * Fetches and normalizes job postings from a Workday career site.
 */
export async function fetchWorkdayJobs(
  config: WorkdayCompanyConfig,
  options: WorkdayFetchOptions = {}
): Promise<Job[]> {
  const url = buildWorkdayJobsUrl(config);
  const limit = options.limit ?? 50;
  const searchText = options.searchText ?? "";

  try {
    const response = await axios.post<unknown>(
      url,
      {
        appliedFacets: {},
        limit,
        offset: 0,
        searchText,
      },
      {
        timeout: 30_000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const parsed = workdayResponseSchema.parse(response.data);

    return parsed.jobPostings.map((posting, index) => ({
      source: "workday",
      externalId: posting.externalPath || `${config.tenant}-${index}`,
      title: posting.title,
      company: config.name,
      location: posting.locationsText,
      applyUrl: buildWorkdayApplyUrl(config, posting.externalPath),
      postedAt: posting.postedOn,
      description: posting.bulletFields?.join("\n"),
    }));
  } catch (error) {
    logger.error(
      { err: error, company: config.name, source: "workday" },
      "Failed to fetch Workday jobs"
    );
    return [];
  }
}
