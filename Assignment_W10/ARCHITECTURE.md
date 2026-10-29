# Architecture Analysis — Monolithic vs Microservices

**Course:** Advanced Web Development Frameworks (ITUE301)  
**Week:** 10 | **CO:** CO4 / **PO:** PO3  
**Author:** Aayush Kathiriya  
**Repository:** `assignment-w10-aayushkathiriya`  

---

## 1. Overview

This document analyses the Task Management application from two architectural perspectives:

1. **Current State** — a classic monolithic Express.js application.
2. **Proposed Future State** — a microservices decomposition with an API Gateway.

The analysis covers structural diagrams, a trade-off comparison, a decision recommendation, and a note on stateless service design via JWT.

---

## 2. Current Monolithic Structure

### 2.1 ASCII Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT LAYER                      │
│                                                     │
│              [React Frontend / Postman]             │
│          http://localhost:3000  (dev server)        │
└─────────────────────────┬───────────────────────────┘
                          │  HTTP/HTTPS
                          ▼
┌─────────────────────────────────────────────────────┐
│                 MONOLITHIC EXPRESS APP               │
│                  http://localhost:5000               │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │              Middleware Stack                │   │
│  │  express.json() → mongoSanitize → headers   │   │
│  └─────────────────────────────────────────────┘   │
│                          │                          │
│        ┌─────────────────┼──────────────┐           │
│        ▼                 ▼              ▼           │
│  ┌──────────┐   ┌──────────────┐  ┌──────────┐    │
│  │  Auth    │   │  Task Routes │  │  Cache   │    │
│  │  Routes  │   │  GET /tasks  │  │  Layer   │    │
│  │ (future) │   │  POST /tasks │  │ node-    │    │
│  │          │   │  PUT /:id    │  │ cache    │    │
│  │          │   │  PATCH /:id  │  │ TTL=120s │    │
│  │          │   │  DELETE /:id │  └──────────┘    │
│  └──────────┘   └──────────────┘                  │
│                          │                          │
│  ┌───────────────────────────────────────────────┐ │
│  │            Event Emitter (Node.js)             │ │
│  │   emits: task.created, task.updated,           │ │
│  │           task.deleted  (in-process only)       │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                  DATA LAYER                         │
│                                                     │
│   [In-Memory Store / MongoDB]                       │
│   Single shared data source for all domains         │
│   (tasks, users, sessions — all in one DB)          │
└─────────────────────────────────────────────────────┘
```

### 2.2 Key Characteristics of the Current Monolith

| Characteristic | Detail |
|----------------|--------|
| **Codebase** | Single Node.js process (`server.js` entry point) |
| **Deployment unit** | One `npm start` command starts everything |
| **Database** | Single shared data store (in-memory / one MongoDB DB) |
| **Inter-module communication** | Direct function calls and `require()` imports |
| **Scaling** | Vertical only — entire app must be scaled as one unit |
| **Event handling** | Node.js `EventEmitter` (in-process, no persistence) |
| **Authentication** | Middleware applied globally or per-router |

---

## 3. Proposed Microservices Decomposition

### 3.1 Service Identification (Business Capability Mapping)

Each service is aligned to a **single business capability** — not a code file:

| Service | Business Capability | Owns |
|---------|--------------------|----- |
| **Auth Service** | User identity — registration, login, token issuance | `users` collection, JWT secret |
| **Task Service** | Task data lifecycle — CRUD, filtering, caching | `tasks` collection, node-cache / Redis |
| **Notification Service** | Side-effects — email, push, webhooks triggered by task events | `notifications` collection, message queue |

### 3.2 ASCII Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                                                                 │
│                 [React Frontend / Mobile App]                   │
│               http://localhost:3000  (dev server)               │
└────────────────────────────┬────────────────────────────────────┘
                             │  HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY                               │
│                    http://localhost:8000                         │
│                                                                 │
│  • Single entry point for all clients                           │
│  • JWT validation (forwards decoded claims downstream)          │
│  • Rate limiting & request logging                              │
│  • Routes requests to the correct downstream service            │
└──────┬──────────────────────┬────────────────────────┬──────────┘
       │                      │                        │
       ▼                      ▼                        ▼
┌─────────────┐    ┌────────────────────┐    ┌──────────────────────┐
│ AUTH SERVICE│    │   TASK SERVICE     │    │ NOTIFICATION SERVICE  │
│  :4001      │    │      :4002         │    │       :4003           │
│             │    │                    │    │                       │
│ POST /auth  │    │ GET    /tasks      │    │ Listens for events:   │
│   /register │    │ POST   /tasks      │    │  task.created         │
│   /login    │    │ GET    /tasks/:id  │    │  task.updated         │
│   /refresh  │    │ PUT    /tasks/:id  │    │  task.deleted         │
│   /logout   │    │ PATCH  /tasks/:id  │    │                       │
│             │    │ DELETE /tasks/:id  │    │ Sends:                │
│ Issues JWT  │    │                    │    │  • Email alerts       │
│ Validates   │    │ node-cache / Redis │    │  • Push notifications │
│ tokens      │    │ (TTL = 120s)       │    │  • Webhook calls      │
└──────┬──────┘    └─────────┬──────────┘    └──────────┬───────────┘
       │                     │                           │
       ▼                     ▼                           ▼
┌────────────┐    ┌──────────────────┐    ┌───────────────────────┐
│  Users DB  │    │    Tasks DB      │    │  Message Queue /      │
│ (MongoDB)  │    │  (MongoDB)       │    │  (RabbitMQ / BullMQ)  │
│ users coll.│    │  tasks coll.     │    │  Persisted job queue  │
└────────────┘    └──────────────────┘    └───────────────────────┘

Inter-service communication:
  Task Service ──[event/queue]──► Notification Service
  API Gateway  ──[HTTP/gRPC]───► Auth / Task / Notification Services
```

### 3.3 Service Boundaries — What Moves Where

| Current File / Module | Monolith Location | Microservice Owner |
|-----------------------|-------------------|--------------------|
| `routes/tasks.js` | `server.js` → `/tasks` | **Task Service** |
| `models/taskModel.js` | Shared in-memory store | **Task Service** (owns `tasks` collection) |
| `node-cache` middleware | `server.js` | **Task Service** (per-service cache) |
| Auth middleware (JWT verify) | `server.js` globally | **Auth Service** + **API Gateway** |
| Event emissions (`task.created`) | `routes/tasks.js` | **Notification Service** subscriber |
| Security headers / rate limit | `server.js` middleware | **API Gateway** |
| MongoDB connection | Single shared connection | Split: one DB per service (or one DB, separate collections with strict ownership) |

---

## 4. Trade-Off Comparison Table

| Aspect | Monolith | Microservices |
|--------|----------|---------------|
| **Deployment** | Single `npm start` deploys everything. One pipeline, one artifact. Simple for a solo student project. | Each service deploys independently. `Auth Service` can be updated and redeployed without touching `Task Service`. Requires Docker, Kubernetes, or separate CI/CD per service. |
| **Scalability** | The entire Express app must be scaled as one unit. If only `GET /tasks` is the hot path, we still scale auth and notifications alongside it — wasteful. | **Task Service** can be horizontally scaled independently (e.g., 5 replicas behind Nginx) while Auth Service stays at 1 replica. Load is isolated per capability. |
| **Complexity** | Low. All code is in one repo, one process, one `require()` graph. Debugging is straightforward — one log stream, one stack trace. | High. Network calls replace function calls. Each service needs health checks, service discovery, retry logic, distributed tracing (Jaeger/Zipkin), and separate logging pipelines. |
| **Team Size Fit** | Ideal for **1–3 developers** on a single codebase. No coordination overhead for deployments. | Designed for **multiple teams** (Conway's Law): one team per service, deploying independently without blocking each other. Adds significant coordination overhead for small teams. |
| **Fault Isolation** | A crash in the cache layer (or any module) brings down the entire app. One bad `require()` can break all routes. | A crash in `Notification Service` does **not** affect `Task Service`. Circuit breakers and fallbacks contain failures to individual services. |
| **Data Management** | Single shared database — easy joins, ACID transactions across all entities. | Each service ideally owns its own database. Cross-service queries require API calls or event-driven data replication; distributed transactions are complex (Saga pattern). |
| **Development Speed** | Fast for early-stage development. No inter-service API contracts to maintain. | Slower initially due to boilerplate per service, but faster at scale when teams work in parallel without merge conflicts across services. |
| **Testing** | One test suite covers the entire app. Integration tests are simple. | Each service has unit + contract tests. End-to-end tests must spin up all services (e.g., via `docker-compose`). Testing complexity grows linearly with service count. |
| **Operational Cost** | Minimal. One VM or Heroku dyno runs the whole app. | Each service needs its own runtime, monitoring, and potentially its own database instance — 3× or more infrastructure cost for the same feature set. |
| **Observability** | Single log file, single metrics endpoint. Easy to trace a request. | Requires distributed tracing (correlation IDs across services), centralised log aggregation (ELK Stack), and per-service dashboards. |

---

## 5. Decision — Monolith vs Microservices for This Project

**Recommendation: Monolith — for now.**

For a 5th-semester student project, the **monolithic architecture is clearly the more appropriate choice**, and the numbers prove it. The Task Management API serves a **single team of one developer**, manages one data domain (tasks), and runs on a local development machine. Introducing microservices at this scale would mean maintaining three separate Express applications, a message queue (RabbitMQ or BullMQ), an API Gateway, Docker containers, and independent CI/CD pipelines — all before writing a single line of business logic. This is the classic "distributed monolith" trap: all the operational complexity of microservices with none of the organisational benefits.

The monolith delivers everything needed: the Task Service logic, caching, and security headers are in a single deployable unit that runs with `npm start`. When the project grows — when a second team takes ownership of notifications, or when `GET /tasks` begins receiving thousands of concurrent requests that justify independent scaling — **that is the signal to extract the first microservice**. Martin Fowler's "MonolithFirst" pattern explicitly recommends this approach: build as a monolith until the seams between business capabilities become clear, then decompose surgically. For a student practicum, the monolith also provides a superior learning experience: debugging a distributed system across three services with network partitions and partial failures is an advanced operations skill that builds on, rather than replaces, solid fundamentals.

**Extract to microservices when:**
- The notification side-effects need a persistent, reliable queue (tasks lost on crash).
- A second developer team owns the Auth domain and needs to deploy independently.
- Load testing shows `GET /tasks` saturating a single Node.js process under sustained traffic.

---

## 6. Stateless Services — JWT and Horizontal Scaling

### 6.1 What "Stateless" Means

A **stateless service** does not store any client-specific data between requests. Every request must carry all the information the server needs to process it — the server does not look anything up in a session store. HTTP is inherently stateless; session-based architectures add statefulness back by keeping server-side session records.

### 6.2 How JWT Makes the Task Service Stateless

In the current (and proposed) architecture, authentication uses **JSON Web Tokens (JWT)**:

```
Client Request:
  GET /tasks
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                          └─────────────────────────────────────┘
                          Self-contained token — contains userId,
                          role, expiry. Signed with HMAC-SHA256.

Task Service receives request:
  1. Verifies JWT signature using shared secret (no DB lookup needed).
  2. Decodes claims: { userId: "u123", role: "user", exp: 1735689600 }
  3. Processes GET /tasks using the decoded userId.
  4. Returns response.
  ✓ No session table queried. No inter-service call to Auth Service for every request.
```

The token is **cryptographically self-verifiable** — the Task Service only needs the JWT secret (an environment variable) to validate the token. It does not ping the Auth Service on every request. This is the key property that enables statelessness.

### 6.3 Why Statelessness Matters for Horizontal Scaling

```
Without JWT (session-based — stateful):
  ┌──────────┐     ┌───────────┐     ┌──────────────────────────┐
  │  Client  │────►│  Nginx    │────►│ Task Service Instance 1  │
  └──────────┘     │  (LB)     │     │ Session: {userId: "u123"} │ ← sticky session required!
                   └───────────┘     └──────────────────────────┘
                                     ┌──────────────────────────┐
                                     │ Task Service Instance 2  │
                                     │ (no session for u123)    │ ← request routed here = 401!
                                     └──────────────────────────┘

With JWT (stateless):
  ┌──────────┐     ┌───────────┐     ┌──────────────────────────┐
  │  Client  │────►│  Nginx    │────►│ Task Service Instance 1  │
  │ carries  │     │  (LB)     │     │ Verify JWT → process ✓   │
  │  JWT     │     │ round     │     └──────────────────────────┘
  └──────────┘     │ robin     │     ┌──────────────────────────┐
                   └───────────┘────►│ Task Service Instance 2  │
                                     │ Verify JWT → process ✓   │
                                     └──────────────────────────┘
  Any instance can handle any request. No sticky sessions needed.
  Adding a 3rd instance requires zero configuration changes.
```

Because **every Task Service instance can independently verify the JWT** using the same shared secret:
- The **load balancer can route requests to any instance** — round-robin, least-connections, or random.
- **Scaling out is instant**: spin up a new replica, point the load balancer at it, and it immediately handles authenticated traffic.
- **No shared session store is needed** (no Redis or Memcached just for sessions), reducing infrastructure cost and eliminating a potential single point of failure.

### 6.4 JWT Statelessness Trade-offs

| Benefit | Trade-off |
|---------|-----------|
| Zero server-side session state | Cannot revoke a token before it expires (requires a blocklist — which reintroduces statefulness) |
| Any replica handles any request | Token payload is visible to anyone (base64-encoded, not encrypted) — never store secrets in claims |
| Horizontal scaling without coordination | Long-lived tokens are a security risk; keep expiry short (15–60 min) and use refresh tokens |
| Works across microservices without shared sessions | JWT size grows with claims; large tokens increase HTTP overhead on every request |

---

## 7. Summary

```
Current Architecture:  Monolith (appropriate for this stage)
  Express App → shared in-memory/MongoDB → all modules in one process

Proposed Future:  Microservices (when justified by scale or team growth)
  API Gateway → Auth Service + Task Service + Notification Service
  Each service owns its DB; inter-service comms via events/HTTP

Key Enabler:  JWT-based stateless authentication
  → Self-verifiable tokens → no session store → horizontal scaling
  → Any Task Service replica handles any authenticated request
```

---

## 8. References

- Newman, S. (2021). *Building Microservices* (2nd ed.). O'Reilly Media.
- Fowler, M. (2015). *MonolithFirst*. martinfowler.com. https://martinfowler.com/bliki/MonolithFirst.html
- Richardson, C. (2018). *Microservices Patterns*. Manning Publications.
- Auth0. (2024). *Introduction to JSON Web Tokens*. https://jwt.io/introduction
- Fowler, M., & Lewis, J. (2014). *Microservices: a definition of this new architectural term*. martinfowler.com.
- Node.js Foundation. (2024). *Node.js best practices — Stateless services*. https://github.com/goldbergyoni/nodebestpractices
