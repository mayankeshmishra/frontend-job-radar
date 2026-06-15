"use client";

import { Briefcase, CheckCircle2, EyeOff, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { JobStats } from "@/types/job";

interface StatsCardsProps {
  stats: JobStats;
  loading?: boolean;
}

const statItems = [
  {
    key: "total" as const,
    label: "Total Jobs",
    icon: Briefcase,
  },
  {
    key: "new" as const,
    label: "New Jobs",
    icon: Sparkles,
  },
  {
    key: "applied" as const,
    label: "Applied Jobs",
    icon: CheckCircle2,
  },
  {
    key: "ignored" as const,
    label: "Ignored Jobs",
    icon: EyeOff,
  },
];

export function StatsCards({ stats, loading = false }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statItems.map(({ key, label, icon: Icon }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <Icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-semibold tracking-tight">{stats[key]}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
