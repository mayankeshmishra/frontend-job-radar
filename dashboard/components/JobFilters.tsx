"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_FILTERS,
  JOB_SOURCES,
  STATUS_FILTER_OPTIONS,
  type JobFilters as JobFiltersState,
  type JobSource,
  type StatusFilter,
} from "@/types/job";

interface JobFiltersProps {
  filters: JobFiltersState;
  onFiltersChange: (filters: JobFiltersState) => void;
}

function hasActiveFilters(filters: JobFiltersState): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.status !== DEFAULT_FILTERS.status ||
    filters.source !== DEFAULT_FILTERS.source
  );
}

export function JobFilters({ filters, onFiltersChange }: JobFiltersProps) {
  const showClear = hasActiveFilters(filters);

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium">Filters</h2>
        {showClear ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange(DEFAULT_FILTERS)}
          >
            <X className="size-4" />
            Clear filters
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="job-search">Search</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="job-search"
              placeholder="Company or role..."
              value={filters.search}
              onChange={(event) =>
                onFiltersChange({ ...filters, search: event.target.value })
              }
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status-filter">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, status: value as StatusFilter })
            }
          >
            <SelectTrigger id="status-filter" className="w-full">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="source-filter">Source</Label>
          <Select
            value={filters.source}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                source: value as JobSource | "all",
              })
            }
          >
            <SelectTrigger id="source-filter" className="w-full">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {JOB_SOURCES.map((source) => (
                <SelectItem key={source} value={source}>
                  {source.charAt(0).toUpperCase() + source.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use JobFilters */
export const JobFiltersBar = JobFilters;
