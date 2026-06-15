import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_CHAT_ID: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().email(),
  EMAIL_TO: z.string().email(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).optional(),
});

export type Env = z.infer<typeof envSchema>;

const REQUIRED_KEYS = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_CHAT_ID",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "EMAIL_TO",
] as const;

function envSetupHint(): string {
  const root = process.cwd();
  const hasEnv = existsSync(resolve(root, ".env"));
  const hasLocal = existsSync(resolve(root, ".env.local"));

  if (!hasEnv && !hasLocal) {
    return "Create .env.local from .env.local.example and fill in your credentials.";
  }

  return "Check that all required variables are set in .env or .env.local.";
}

/**
 * Validates and returns required environment variables.
 */
export function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const missing = REQUIRED_KEYS.filter((key) => !process.env[key]);
    throw new Error(
      `Missing environment variables: ${missing.join(", ")}. ${envSetupHint()}`
    );
  }

  return result.data;
}
