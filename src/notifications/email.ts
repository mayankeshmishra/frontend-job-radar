import { Resend } from "resend";
import type { Env } from "../config/env";
import type { Job } from "../types/job";
import { logger } from "../utils/logger";

/**
 * Sends an email alert for a newly discovered job via Resend.
 */
export async function sendEmailAlert(env: Env, job: Job): Promise<void> {
  const resend = new Resend(env.RESEND_API_KEY);

  const subject = `New Frontend Role: ${job.title} at ${job.company}`;
  const html = `
    <h2>🚨 New Frontend Opportunity</h2>
    <p><strong>Company:</strong> ${job.company}</p>
    <p><strong>Role:</strong> ${job.title}</p>
    <p><strong>Location:</strong> ${job.location ?? "Not specified"}</p>
    <p><strong>Source:</strong> ${job.source}</p>
    <p><a href="${job.applyUrl}">Apply now</a></p>
  `;

  try {
    const { error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: env.EMAIL_TO,
      subject,
      html,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    logger.error({ err: error, job }, "Failed to send email alert");
    throw error;
  }
}
