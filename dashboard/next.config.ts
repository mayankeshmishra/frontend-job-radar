import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dashboardRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: dashboardRoot,
  },
  outputFileTracingRoot: dashboardRoot,
};

export default nextConfig;
