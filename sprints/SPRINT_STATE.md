# Speclint — Sprint State Machine

*Tracks sprint lifecycle per Sprint OS rules. Cannot open N+1 if N is not Closed.*

| Sprint | State | Opened | Closed | Review Artifact |
|--------|-------|--------|--------|-----------------|
| 1 | Closed | 2026-02-28 | 2026-02-28 | sprints/SPRINT_LOG.md (pre-Sprint OS) |
| 2 | Closed | 2026-03-01 | 2026-03-01 | sprints/SPRINT_LOG.md (pre-Sprint OS) |
| 3 | Closed | 2026-03-01 | 2026-03-01 | sprints/SPRINT_LOG.md (pre-Sprint OS) |
| 4 | Closed | 2026-03-01 | 2026-03-01 | sprints/SPRINT_LOG.md (pre-Sprint OS) |
| 5 | Closed | 2026-03-01 | 2026-03-01 | sprints/SPRINT_LOG.md (pre-Sprint OS) |
| 6 | Closed | 2026-03-01 | 2026-03-01 | sprints/SPRINT_LOG.md (pre-Sprint OS) |
| 7 | Closed | 2026-03-01 | 2026-03-02 | sprints/SPRINT_LOG.md (pre-Sprint OS) |
| 8 | Closed | 2026-03-03 | 2026-03-07 | sprints/SPRINT_LOG.md |
| 9 | Closed | 2026-03-07 | 2026-03-09 | sprints/retro-sprint-9.md |
| 10 | Closed | 2026-03-09 | 2026-03-09 | sprints/retro-sprint-10.md |

*Note: Sprints 1-7 predate Sprint OS adoption. Retroactively marked Closed based on SPRINT_LOG.md evidence. Sprint 8 is the first sprint under full Sprint OS governance (eval gate, delegation telemetry, review template).*

## Sprint State Definitions

- **Draft** — Spec written, not yet approved for work
- **Active** — Work in progress
- **Pending Review** — All spec items complete, awaiting review artifact
- **Closed** — Review artifact committed, sprint formally closed

## Rules

1. Cannot open Sprint N+1 if Sprint N is not `Closed`
2. Sprint transitions to `Pending Review` when all spec items are complete
3. Sprint cannot transition to `Closed` without a review artifact committed to `sprints/`
4. Alexander checks this file before starting any new sprint work
5. Every sprint review must include the eval gate (see `sprint-os/REVIEW_TEMPLATE.md`)

---
*Part of: [[products/speclint/BACKLOG|speclint Backlog]] · [[MEMORY|Memory]]*
