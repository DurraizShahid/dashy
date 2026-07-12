# Stable Baseline: Ingestion & Retrieval

| Field            | Value                                              |
|------------------|----------------------------------------------------|
| **Tag**          | `dashy-ingestion-retrieval-stable-v1`              |
| **Commit SHA**   | `c783509a4ed55a4f2d28623e40157a55072c6e09`         |
| **Date**         | 2026-07-13                                         |
| **Branch**       | `main`                                             |

## What is stable

- Clerk authentication (login, session management, protected routes)
- hivemind-api integration (authenticated API calls, data display)
- UI components and page layouts
- Search UI and agent context display
- Document upload and ingestion UI

## What not to change casually

- Authentication flow (Clerk middleware, session handling, API token passing)
- API contract with hivemind-api (endpoints, request/response shapes)
- Core page layouts and navigation structure
- Search and agent context UI
- Document upload and ingestion UI workflow
- Environment variable configuration

## Next sprint

**Graph memory** — introducing persistent graph-based memory for agents.
