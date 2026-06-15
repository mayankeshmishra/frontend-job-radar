import { loadDotenvFiles } from "../config/dotenv";

loadDotenvFiles();

import { fetchGreenhouseJobs } from "../collectors/greenhouse";
import { loadEnv } from "../config/env";
import { loadCompaniesConfig } from "../config/loader";
import { getJobs } from "../db/supabase";
import { verifyJobsSchema } from "../db/schema";
import { matchesJob } from "../filters/matcher";
import { sendEmailAlert } from "../notifications/email";
import { sendTelegramAlert } from "../notifications/telegram";
import type { Job } from "../types/job";

function printSection(title: string): void {
  console.log(`\n=== ${title} ===`);
}

function printOk(message: string): void {
  console.log(`✓ ${message}`);
}

function printFail(message: string): void {
  console.log(`✗ ${message}`);
}

async function checkCollectors(): Promise<{ total: number; matched: Job[] }> {
  printSection("Collectors");
  const companies = loadCompaniesConfig();
  const sampleCompany = companies.greenhouse[0] ?? "stripe";

  const jobs = await fetchGreenhouseJobs(sampleCompany);
  const matched = jobs.filter((job) => matchesJob(job.title));

  printOk(`Greenhouse (${sampleCompany}): ${jobs.length} jobs fetched`);
  printOk(`${matched.length} match frontend keywords`);

  if (matched.length > 0) {
    console.log("\nSample matches:");
    for (const job of matched.slice(0, 5)) {
      console.log(`  - ${job.title} @ ${job.company}`);
    }
  } else {
    printFail("No frontend matches found in sample — check config/keywords.json");
  }

  return { total: jobs.length, matched };
}

async function checkSupabase(env: ReturnType<typeof loadEnv>): Promise<boolean> {
  printSection("Supabase");

  const schema = await verifyJobsSchema(env);
  if (!schema.ok) {
    printFail(`Schema check failed: ${schema.error}`);
    if (schema.missingColumns.length > 0) {
      console.log(`  Missing columns: ${schema.missingColumns.join(", ")}`);
    }
    console.log("\n  Fix: run this in Supabase SQL Editor:");
    console.log("  supabase/migrations/001_create_jobs.sql");
    console.log("  or supabase/migrations/002_add_description_column.sql");
    return false;
  }

  printOk("jobs table schema looks correct");

  const stored = await getJobs(env);
  printOk(`${stored.length} jobs currently stored`);

  return true;
}

async function checkNotifications(
  env: ReturnType<typeof loadEnv>,
  sampleJob: Job | undefined,
  sendTest: boolean
): Promise<void> {
  printSection("Notifications");

  if (!sampleJob) {
    printFail("No sample job available — skipping notification test");
    return;
  }

  if (!sendTest) {
    console.log("Skipping live notification test (pass --notify to send test alerts)");
    return;
  }

  try {
    await sendTelegramAlert(env, sampleJob);
    printOk("Telegram test alert sent");
  } catch (error) {
    printFail(`Telegram failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    await sendEmailAlert(env, sampleJob);
    printOk("Email test alert sent");
  } catch (error) {
    printFail(`Email failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function main(): Promise<void> {
  const sendTest = process.argv.includes("--notify");

  console.log("Frontend Job Radar — Verification\n");

  printSection("Environment");
  let env: ReturnType<typeof loadEnv>;
  try {
    env = loadEnv();
    printOk("All required environment variables are set");
  } catch (error) {
    printFail(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
    return;
  }

  const { matched } = await checkCollectors();
  const schemaOk = await checkSupabase(env);
  await checkNotifications(env, matched[0], sendTest);

  printSection("Summary");
  if (schemaOk && matched.length > 0) {
    printOk("System looks ready — run npm start to process all sources");
    console.log("\nExpected flow: fetch → filter → save to Supabase → notify");
  } else if (!schemaOk) {
    printFail("Fix Supabase schema, then re-run: npm run verify");
    process.exitCode = 1;
  } else {
    printFail("Collectors work but no matches found in sample — adjust keywords or companies");
  }
}

main().catch((error: unknown) => {
  console.error("Verification failed:", error);
  process.exitCode = 1;
});
