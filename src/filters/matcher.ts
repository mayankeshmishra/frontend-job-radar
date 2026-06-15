import { loadKeywordsConfig, type KeywordsConfig } from "../config/loader";

let cachedKeywords: KeywordsConfig | null = null;

function getKeywords(): KeywordsConfig {
  if (!cachedKeywords) {
    cachedKeywords = loadKeywordsConfig();
  }
  return cachedKeywords;
}

/**
 * Resets cached keywords (useful for testing).
 */
export function resetKeywordCache(): void {
  cachedKeywords = null;
}

/**
 * Returns true when the title contains a frontend role keyword.
 */
export function isFrontendRole(title: string): boolean {
  const normalizedTitle = title.toLowerCase();
  return getKeywords().include.some((keyword) => normalizedTitle.includes(keyword.toLowerCase()));
}

/**
 * Returns true when the title contains an excluded role keyword.
 */
export function isExcludedRole(title: string): boolean {
  const normalizedTitle = title.toLowerCase();
  return getKeywords().exclude.some((keyword) => normalizedTitle.includes(keyword.toLowerCase()));
}

/**
 * Returns true when the job title matches frontend criteria and is not excluded.
 */
export function matchesJob(title: string): boolean {
  return isFrontendRole(title) && !isExcludedRole(title);
}
