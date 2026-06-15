# Frontend Job Radar

## Objective

Build a production-grade job monitoring platform for a Senior/Lead Frontend Engineer.

The platform should continuously monitor job openings from:

* Greenhouse
* Lever
* Workday
* Company Career Pages
* LinkedIn (optional, phase 2)

and notify the user immediately when matching jobs are posted.

The system must run on GitHub Actions every 5 minutes and use Supabase as the datastore.

---

# Technical Requirements

## Stack

Language:

* TypeScript

Runtime:

* Node.js 22+

Database:

* Supabase PostgreSQL

Notifications:

* Telegram
* Email (Resend)

Hosting:

* GitHub Actions

Logging:

* Pino

Validation:

* Zod

HTTP Client:

* Axios

---

# Repository Structure

frontend-job-radar/

.github/
workflows/
monitor.yml

src/

config/

collectors/
greenhouse.ts
lever.ts
workday.ts
linkedin.ts

db/
supabase.ts

notifications/
telegram.ts
email.ts

filters/
matcher.ts

services/
jobProcessor.ts

types/
job.ts

utils/
logger.ts

index.ts

.env.example
.env.local.example

config/

companies.json
keywords.json

README.md

---

# Job Entity

Create a shared type.

interface Job {
source: string;
externalId: string;

title: string;
company: string;

location?: string;

applyUrl: string;

postedAt?: string;

description?: string;
}

---

# Keywords

Use:

[
"frontend engineer",
"senior frontend engineer",
"lead frontend engineer",
"staff frontend engineer",
"principal frontend engineer",
"frontend architect",
"ui engineer",
"software engineer frontend"
]

Exclude:

[
"android",
"ios",
"backend",
"sdet",
"qa",
"test engineer"
]

Matching must be case insensitive.

---

# Database

Create Supabase integration.

Table name:

jobs

Columns:

id uuid primary key

source text

external_id text

title text

company text

location text

apply_url text

posted_at timestamptz

description text

discovered_at timestamptz

Unique constraint:

(source, external_id)

---

# Greenhouse Collector

Create collector:

collectors/greenhouse.ts

Input:

company identifier

Example:

stripe

Endpoint:

https://boards-api.greenhouse.io/v1/boards/{company}/jobs

Normalize output into Job type.

---

# Lever Collector

Create collector:

collectors/lever.ts

Input:

company identifier

Endpoint:

https://api.lever.co/v0/postings/{company}

Normalize output.

---

# Workday Collector

Create reusable Workday parser.

Support company-specific configurations.

Return normalized Job objects.

---

# LinkedIn Collector

Phase 2.

Create interface only.

Do not implement scraping logic.

Provide abstraction:

fetchLinkedInJobs()

Return Job[].

---

# Filtering Engine

Create:

filters/matcher.ts

Functions:

isFrontendRole(title)

isExcludedRole(title)

matchesJob(title)

Use keyword matching.

---

# Supabase Service

Create:

db/supabase.ts

Functions:

jobExists(source, externalId)

saveJob(job)

getJobs()

---

# Telegram Notifications

Create:

notifications/telegram.ts

Function:

sendTelegramAlert(job)

Message format:

🚨 New Frontend Opportunity

Company: {company}

Role: {title}

Location: {location}

Apply:
{url}

Source:
{source}

---

# Email Notifications

Create:

notifications/email.ts

Function:

sendEmailAlert(job)

Use Resend.

---

# Job Processing Pipeline

Create:

services/jobProcessor.ts

Responsibilities:

1. Receive Job
2. Filter
3. Deduplicate
4. Save
5. Notify

Pseudo:

if matchesJob(job.title)

if !jobExists

saveJob

sendTelegramAlert

sendEmailAlert

---

# Main Entry Point

Create:

src/index.ts

Workflow:

Load configs

Fetch Greenhouse jobs

Fetch Lever jobs

Fetch Workday jobs

Flatten results

Process jobs

Log summary

Exit

---

# Companies Configuration

Create:

config/companies.json

Structure:

{
"greenhouse": [
"stripe",
"airbnb",
"datadog",
"confluent"
],

"lever": [
"coinbase",
"rippling",
"atlassian"
],

"workday": [
{
"name": "Adobe"
},
{
"name": "Salesforce"
}
]
}

---

# Logging

Use Pino.

Log:

start

jobs fetched

jobs matched

jobs saved

notifications sent

errors

---

# Error Handling

No unhandled exceptions.

Collectors must fail independently.

Example:

Greenhouse failure must not stop Lever collection.

---

# GitHub Actions

Create:

.github/workflows/monitor.yml

Runs every 5 minutes.

Cron:

*/5 * * * *

Workflow:

npm ci

npm run build

npm start

---

# README

Generate complete README including:

local setup

supabase setup

telegram setup

resend setup

github actions setup

deployment

troubleshooting

---

# Future Enhancements

Create TODO placeholders for:

AI Match Scoring

Resume Tailoring

One Click Apply

Dashboard

LinkedIn Monitoring

Salary Intelligence

Referral Detection

Daily Digest

---

# Code Quality Requirements

Strict TypeScript.

No any types.

ESLint compatible.

Modular architecture.

SOLID principles.

No duplicated logic.

Use async/await.

Add JSDoc for public functions.

Generate production-ready code.
