# Stable Baselines

## Baseline: Ingestion & Retrieval

| Field            | Value                                              |
|------------------|----------------------------------------------------|
| **Tag**          | `dashy-ingestion-retrieval-stable-v1`              |
| **Commit SHA**   | `c783509a4ed55a4f2d28623e40157a55072c6e09`         |
| **Date**         | 2026-07-13                                         |
| **Branch**       | `main`                                             |

### What is stable

- Clerk authentication (login, session management, protected routes)
- hivemind-api integration (authenticated API calls, data display)
- UI components and page layouts
- Search UI and agent context display
- Document upload and ingestion UI

### What not to change casually

- Authentication flow (Clerk middleware, session handling, API token passing)
- API contract with hivemind-api (endpoints, request/response shapes)
- Core page layouts and navigation structure
- Search and agent context UI
- Document upload and ingestion UI workflow
- Environment variable configuration

### Next sprint

**Graph memory** — introducing persistent graph-based memory for agents.

---

## Baseline: Graph Memory

| Field            | Value                                              |
|------------------|----------------------------------------------------|
| **Tag**          | `dashy-graph-memory-stable-v1`                     |
| **Commit SHA**   | `66330c4e1f11e4900f4a8566ad593a22c30db11e`        |
| **Date**         | 2026-07-16                                         |
| **Branch**       | `main`                                             |

### What is stable

- Clerk authentication (login, session management, protected routes)
- hivemind-api integration (authenticated API calls, data display)
- UI components and page layouts
- Document upload and ingestion UI
- Search UI and agent context display
- Graph memory UI (entity browser, document-entity relationship view, graph overview)
- Knowledge page with graph-derived context
- Health monitoring dashboard
- Job tracking UI with status and details

### What not to change casually

- Authentication flow (Clerk middleware, session handling, API token passing)
- API contract with hivemind-api (endpoints, request/response shapes)
- Core page layouts and navigation structure
- Graph memory UI entity/document page routes
- Document upload and ingestion UI workflow
- Environment variable configuration

### Next sprint

**LLM-powered entity extraction + graph-aware agent context** — introducing LLM-driven extraction of entities and relationships from ingested documents, and enriching agent context with graph-derived knowledge.
