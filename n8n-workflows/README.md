# HelpTribe n8n Workflows

Automated lead scraping workflows that feed into the HelpTribe CRM dashboard.

## Workflows

### 1. Reddit Lead Scraper to CRM
**ID:** `RJ4lYorRsWDcbfrt`
**Trigger:** Every hour + Manual
**What it does:**
- Scrapes Reddit posts matching HelpTribe product keywords (Dilivygo, Marlin, Terro, Haigo)
- Detects product match, market, and pain signals
- Scores leads 0-100 based on keyword relevance, pain signals, market, and engagement
- Sends scored leads (>= 40) to CRM via POST /api/leads/ingest
- Deduplicates using n8n static data (30-day window)

### 2. Social Media Lead Scraper to CRM
**ID:** `BTN7cifUuBqSgLWQ`
**Trigger:** Every 6 hours + Manual
**What it does:**
- Searches YouTube, Google Maps, LinkedIn, Facebook, Instagram, and directories (Capterra)
- Scores leads based on product/pain keyword matches and market
- Sends scored leads (>= 35) to CRM via POST /api/leads/ingest
- Deduplicates using n8n static data (30-day window)

### 3. Manual Social Lead Import Webhook
**ID:** `bvEByausoKsmTWcg`
**Trigger:** POST webhook at `/webhook/import-social-lead`
**What it does:**
- Receives a single lead from the CRM dashboard (manual import form)
- Auto-detects product, market, and pain signals from title/description
- Scores the lead and sends to CRM
- Returns 200 (success) or 400 (error/excluded)

## Webhook Payload (Workflow 3)

```json
{
  "source": "LinkedIn",
  "title": "Looking for restaurant POS alternative",
  "description": "We are a cloud kitchen in Dubai using Toast but it is too expensive...",
  "url": "https://linkedin.com/post/123",
  "author": "John Doe",
  "product": "Dilivygo",
  "market": "UAE",
  "email": "john@example.com",
  "phone": "+971501234567",
  "company": "Cloud Kitchen Co"
}
```

**Required fields:** At least one of `title` or `description`
**Auto-detected:** product, market (if not provided)

## Webhook URL

```
https://n8n-production-5ec2.up.railway.app/webhook/import-social-lead
```

## CRM Endpoint

All workflows POST leads to:
```
https://dashy-production-8f23.up.railway.app/api/leads/ingest
```

## Activation

All workflows are created **inactive** by default. Activate them in the n8n dashboard:

1. Go to https://n8n-production-5ec2.up.railway.app
2. Open each workflow
3. Toggle "Active" in the top-right

**Important:** Do NOT activate workflows until the CRM endpoint is confirmed working.

## Environment Variables (n8n)

No environment variables are required. All endpoints are hardcoded in the workflow code nodes.

## Deduplication

Workflows 1 and 2 use n8n static data to track seen posts. Posts are remembered for 30 days, then purged automatically. This prevents duplicate leads across runs.

## Market Exclusion

Leads matching Pakistan market keywords (pakistan, karachi, lahore, islamabad, etc.) are automatically excluded unless clearly operating in target markets (UAE, Saudi, USA, UK, Australia).
