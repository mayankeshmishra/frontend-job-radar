import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

const workdayCompanySchema = z.object({
  name: z.string(),
  tenant: z.string(),
  instance: z.string(),
  site: z.string(),
});

const companiesSchema = z.object({
  greenhouse: z.array(z.string()),
  lever: z.array(z.string()),
  workday: z.array(workdayCompanySchema),
});

const keywordsSchema = z.object({
  include: z.array(z.string()),
  exclude: z.array(z.string()),
});

export type WorkdayCompanyConfig = z.infer<typeof workdayCompanySchema>;
export type CompaniesConfig = z.infer<typeof companiesSchema>;
export type KeywordsConfig = z.infer<typeof keywordsSchema>;

function resolveConfigPath(filename: string): string {
  return join(process.cwd(), "config", filename);
}

/**
 * Loads and validates companies configuration.
 */
export function loadCompaniesConfig(): CompaniesConfig {
  const raw = readFileSync(resolveConfigPath("companies.json"), "utf-8");
  return companiesSchema.parse(JSON.parse(raw));
}

/**
 * Loads and validates keyword matching configuration.
 */
export function loadKeywordsConfig(): KeywordsConfig {
  const raw = readFileSync(resolveConfigPath("keywords.json"), "utf-8");
  return keywordsSchema.parse(JSON.parse(raw));
}
