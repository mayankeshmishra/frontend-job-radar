import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";

/**
 * Loads environment files from the project root.
 * `.env.local` overrides `.env` when present (local development convention).
 */
export function loadDotenvFiles(): void {
  const root = process.cwd();
  const envPath = resolve(root, ".env");
  const localPath = resolve(root, ".env.local");

  config({ path: envPath });

  if (existsSync(localPath)) {
    config({ path: localPath, override: true });
  }
}
