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

---

## Baseline: Graph Intelligence

| Field            | Value                                              |
|------------------|----------------------------------------------------|
| **Tag**          | `dashy-graph-intelligence-stable-v1`               |
| **Commit SHA**   | `cd24b06c5c7335a6bd6886358dd74f38e59a5340`        |
| **Date**         | 2026-07-16                                         |
| **Branch**       | `main`                                             |

### What is stable

- All Graph Memory stable features
- Graph Overview page aligned with actual backend response shape (warnings field, no fake cards)
- Entity Detail page showing only real backend fields (no confidence/aliases/extractionMethod fakes)
- Document Graph page showing only real backend fields (no fake confidence/mentionCount/snippets)
- Agent Context page with includeGraph toggle and graph context section (entities, relationships, related docs)
- Graph unavailable warning banner when Neo4j is unreachable
- SESSION_EXPIRED redirect on all graph pages
- API client type contract matches backend responses exactly
- Extraction badges and confidence indicators only shown when backend provides the data

### What not to change casually

- All Graph Memory "not to change" items
- Graph page routes and data-fetching patterns
- API client type definitions (must match backend response shapes exactly)
- Graph UI component layout and state management
- Agent context query form and graph enrichment display

### Known Limitations

- Frontend only displays fields currently returned by backend API responses; fields like extractionMethodStats, entityTypeCounts, and relationshipTypeCounts are not yet available from backend
- Entity detail page does not show confidence/aliases/extractionMethod (backend does not return these yet)
- Document graph page does not show entity confidence, mention counts, or extraction badges (backend does not return these yet)
- Chunk snippets are not available on entity detail or document graph pages (backed does not store content in Neo4j)

### Next sprint

**Graph Contract Expansion + LLM Extraction Quality** — expand backend graph read endpoints to surface stored metadata (confidence, extraction method, aliases, evidence chunks), and improve LLM extraction quality with better prompts and validation.

---

## Baseline: Graph Intelligence v1 Final

| Field            | Value                                                           |
|------------------|-----------------------------------------------------------------|
| **Tag**          | `dashy-graph-intelligence-v1-final`                             |
| **Commit SHA**   | `5bcceecd02f348e4baaf0ff447c8962060fb2c92`                     |
| **Date**         | 2026-07-16                                                      |
| **Branch**       | `main`                                                          |

### What is stable

- All Graph Intelligence stable features
- Graph quality dashboard with overview stats cards (entity/relationship/document node counts)
- Extraction method stats display
- Merge suggestions with keep/duplicate comparison and inline merge preview
- Merge history accordion with revert buttons
- Graph rebuild controls (reindex document/tenant, dry-run, clearFirst)
- Graph backfill controls (scope selector, dry-run toggle, result display with queued/skipped/failed counts)
- Frontend types matching backend response shapes: MergeEntitiesPreviewResponse, RevertMergeResponse, MergeHistory*, BackfillGraphResponse, ExtractionCost
- API client methods: getMergePreview, revertMerge, getMergeHistory, backfillGraph

### What not to change casually

- All Graph Intelligence "not to change" items
- Graph quality page layout, data-fetching pattern, and state management
- API client type definitions (must match backend response shapes exactly)
- Dashboard section routing and component structure

### Known Limitations

- Backfill UI requires admin privileges (only visible to system admins)
- Merge preview and revert are best-effort when Neo4j is unavailable (returns safe empty responses)
- No polling/websocket for backfill job status (manual refresh)

### Next sprint

**Autonomous Research Memory** — persistent cross-session memory that agents autonomously read and write during research tasks, grounded in the graph knowledge base.
