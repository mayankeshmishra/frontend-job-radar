import type { Env } from "../config/env";
import { getClient } from "./client";

const REQUIRED_COLUMNS = [
  "id",
  "source",
  "external_id",
  "title",
  "company",
  "location",
  "apply_url",
  "posted_at",
  "description",
  "discovered_at",
  "status",
  "applied_at",
] as const;

export interface SchemaCheckResult {
  ok: boolean;
  missingColumns: string[];
  error?: string;
}

/**
 * Verifies the jobs table exists and exposes all required columns.
 */
export async function verifyJobsSchema(env: Env): Promise<SchemaCheckResult> {
  const client = getClient(env);
  const selectColumns = REQUIRED_COLUMNS.join(", ");

  const { error } = await client.from("jobs").select(selectColumns).limit(1);

  if (!error) {
    return { ok: true, missingColumns: [] };
  }

  const message = error.message ?? "Unknown schema error";
  const missingColumns = REQUIRED_COLUMNS.filter((column) => message.includes(column));

  return {
    ok: false,
    missingColumns: missingColumns.length > 0 ? [...missingColumns] : [...REQUIRED_COLUMNS],
    error: message,
  };
}

export { REQUIRED_COLUMNS };
