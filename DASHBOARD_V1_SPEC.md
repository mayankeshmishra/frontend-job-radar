# Frontend Job Radar Dashboard V1

## Objective

Build a private dashboard for managing discovered jobs.

The dashboard should connect directly to Supabase and allow the user to:

* View jobs
* Search jobs
* Filter jobs
* Open application links
* Mark jobs as applied
* Mark jobs as ignored

This dashboard is intended for a single user.

---

# Stack

Framework:

* Next.js 15 App Router

Language:

* TypeScript

Styling:

* TailwindCSS

Components:

* shadcn/ui

Database:

* Supabase

Deployment:

* Vercel

Authentication:

* Supabase Auth

---

# Pages

## Login

Route:

/login

Features:

* Email login
* Password login

Redirect authenticated users to:

/dashboard

---

## Dashboard

Route:

/dashboard

Show jobs in a table.

Columns:

Company

Role

Location

Source

Posted Date

Status

Actions

---

# Actions

Each row should contain:

Apply

Mark Applied

Ignore

---

# Apply Action

Clicking Apply should:

window.open(job.apply_url)

Open in new tab.

---

# Mark Applied

Update:

status = "applied"

applied_at = now()

Optimistically update UI.

---

# Ignore

Update:

status = "ignored"

Hide from default dashboard view.

---

# Dashboard Filters

Search:

* company
* title

Status filter:

* all
* new
* applied
* ignored

Source filter:

* greenhouse
* lever
* workday

---

# Default Sorting

Newest jobs first.

Sort by:

posted_at desc

fallback:

discovered_at desc

---

# Dashboard Statistics

Top cards:

Total Jobs

New Jobs

Applied Jobs

Ignored Jobs

---

# Responsive Requirements

Desktop:

Table layout

Mobile:

Cards layout

---

# Empty State

Show:

"No jobs found"

---

# Error Handling

Show toast messages.

Examples:

Application marked successfully.

Failed to update status.

---

# Folder Structure

app/

login/

dashboard/

components/

JobTable.tsx

JobFilters.tsx

StatsCards.tsx

lib/

supabase.ts

types/

job.ts

---

# Security

Dashboard must require authentication.

Unauthenticated users:

redirect to /login

---

# Code Quality

Strict TypeScript

No any

Server Components where possible

Reusable components

Clean architecture

Production ready
