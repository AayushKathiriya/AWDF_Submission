# Assignment W10 — Monolithic vs Microservices Architecture Analysis

**Course:** Advanced Web Development Frameworks (ITUE301)  
**Week:** 10 | **CO:** CO4 / **PO:** PO3  
**Author:** Aayush Kathiriya  

## About

Architecture analysis of the Task Management REST API — comparing the current **monolithic** design with a proposed **microservices** decomposition. Documentation-only assignment.

## Key Deliverable

| File | Description |
|------|-------------|
| `ARCHITECTURE.md` | Full analysis: ASCII diagrams, trade-off table, decision paragraph, JWT statelessness note |

## What's Inside ARCHITECTURE.md

| Section | Content |
|---------|---------|
| § 2 — Current Monolith | ASCII diagram of the Express monolith (routes, cache, event emitter, DB) |
| § 3 — Microservices Proposal | Decomposed diagram: API Gateway → Auth / Task / Notification Services |
| § 3.3 — Service Boundaries | Maps each current file to its future microservice owner |
| § 4 — Trade-Off Table | 10-aspect comparison (deployment, scalability, complexity, team size, fault isolation, data management, testing, operational cost, observability) |
| § 5 — Decision | Monolith recommended for 5th-semester project; conditions for future extraction listed |
| § 6 — Stateless Services | How JWT enables stateless Task Service + horizontal scaling diagrams |

## Architecture Decision

> **Monolith is recommended** for this stage of the project.  
> Microservices decomposition is appropriate when a second team takes ownership of a domain, or when sustained load justifies independent scaling.  
> See §5 in `ARCHITECTURE.md` for the full justification.

## Proposed Microservices (Future State)

```
[React Frontend]
       |
  [API Gateway :8000]
  ├── Auth Service :4001     (register, login, JWT issuance)
  ├── Task Service :4002     (CRUD, node-cache, GET /tasks)
  └── Notification Service :4003  (events → email/webhook)
       |
  [MongoDB per service]
```
