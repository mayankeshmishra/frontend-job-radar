import axios from "axios";
import type { Env } from "../config/env";
import type { Job } from "../types/job";
import { logger } from "../utils/logger";

/**
 * Sends a Telegram alert for a newly discovered job.
 */
export async function sendTelegramAlert(env: Env, job: Job): Promise<void> {
  const message = [
    "🚨 New Frontend Opportunity",
    "",
    `Company: ${job.company}`,
    `Role: ${job.title}`,
    `Location: ${job.location ?? "Not specified"}`,
    "",
    "Apply:",
    job.applyUrl,
    "",
    "Source:",
    job.source,
  ].join("\n");

  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    await axios.post(
      url,
      {
        chat_id: env.TELEGRAM_CHAT_ID,
        text: message,
        disable_web_page_preview: false,
      },
      { timeout: 15_000 }
    );
  } catch (error) {
    logger.error({ err: error, job }, "Failed to send Telegram alert");
    throw error;
  }
}
