import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dashboardRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Local dev only: avoid "multiple lockfiles" warning when the repo root
  // also has a package-lock.json. Skip on Vercel where Root Directory is set.
  ...(process.env.VERCEL
    ? {}
    : {
        turbopack: {
          root: dashboardRoot,
        },
      }),
};

export default nextConfig;
