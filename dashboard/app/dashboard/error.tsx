"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h2 className="text-xl font-semibold">Unable to load jobs</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message || "Something went wrong while fetching your job list."}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
