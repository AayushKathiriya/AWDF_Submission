# Richardson Maturity Model — Task Management API Evaluation

**Course:** Advanced Web Development Frameworks (ITUE301)  
**Week:** 4 | **CO:** CO2 / **PO:** PO3  
**Author:** Aayush Kathiriya  
**Repository:** `assignment-w4-aayushkathiriya`  

---

## 1. Overview

The **Richardson Maturity Model (RMM)**, introduced by Leonard Richardson, provides a structured way to measure how RESTful an API truly is. It defines four progressive levels (0-3), each adding more REST constraints on top of the previous.

```
Level 3 - HATEOAS (Hypermedia As The Engine Of Application State)
   up
Level 2 - HTTP Verbs + Status Codes
   up
Level 1 - Individual Resources (Unique URIs)
   up
Level 0 - The Swamp of POX (Plain Old XML / Single URI)
```

---

## 2. Evaluation Table

| Level | Criterion | Does Your API Satisfy This? | Evidence |
|-------|-----------|----------------------------|----------|
| **0** | Single endpoint for all operations (RPC-style, e.g., one `/api` URL with action param) | YES - **Not applicable — API is above Level 0** | The API uses **multiple distinct URIs** (`/tasks`, `/tasks/:id`) instead of a single catch-all endpoint. There is no `?action=createTask` pattern. |
| **1** | Separate, unique URL per resource | YES - **Fully Satisfied** | `/tasks` is the collection resource; `/tasks/:id` is the individual task resource. Each entity has its own addressable URI. |
| **2a** | Correct HTTP Verbs used for each operation | YES - **Fully Satisfied** | `GET /tasks` (read all), `POST /tasks` (create), `GET /tasks/:id` (read one), `PUT /tasks/:id` (full update), `PATCH /tasks/:id` (partial update), `DELETE /tasks/:id` (delete). No misuse of GET for mutations. |
| **2b** | Meaningful HTTP Status Codes returned | YES - **Fully Satisfied** | `200 OK` (reads/updates), `201 Created` (new resource), `204 No Content` (delete), `400 Bad Request` (empty PATCH body), `404 Not Found` (missing resource), `422 Unprocessable Entity` (validation failure). |
| **2c** | `Location` header returned on resource creation | YES - **Fully Satisfied** | `POST /tasks` returns `Location: /tasks/<new-id>` header alongside `201 Created`. |
| **3** | HATEOAS — responses include hypermedia links for discoverability | AWARENESS ONLY (see Section 4) | `_links` object is embedded in every task response body as a preview. Full HATEOAS is not implemented — see Section 4 for the design. |

**Conclusion: The API fully satisfies Level 2** of the Richardson Maturity Model.

---

## 3. Endpoint-by-Endpoint Level 2 Verification

### 3.1 `GET /tasks` — Retrieve All Tasks

| Check | Status | Detail |
|-------|--------|--------|
| HTTP Verb | PASS - `GET` | Safe, idempotent — correct for read operations |
| Status Code (success) | PASS - `200 OK` | Returns task array |
| Status Code (empty) | PASS - `200 OK` | Returns empty array `[]` — not 404 (collection exists) |
| Query filtering | PASS - `?status=pending` | Non-breaking, additive feature |

### 3.2 `POST /tasks` — Create a Task

| Check | Status | Detail |
|-------|--------|--------|
| HTTP Verb | PASS - `POST` | Non-idempotent create — correct |
| Status Code (success) | PASS - `201 Created` | New resource created |
| `Location` header | PASS - Present | `Location: /tasks/<uuid>` |
| Status Code (validation fail) | PASS - `422 Unprocessable Entity` | Missing `title` or invalid enum values |

### 3.3 `GET /tasks/:id` — Retrieve Single Task

| Check | Status | Detail |
|-------|--------|--------|
| HTTP Verb | PASS - `GET` | Idempotent read |
| Status Code (found) | PASS - `200 OK` | Task returned |
| Status Code (not found) | PASS - `404 Not Found` | Clear error message with the missing ID |

### 3.4 `PUT /tasks/:id` — Full Replacement

| Check | Status | Detail |
|-------|--------|--------|
| HTTP Verb | PASS - `PUT` | Idempotent full replacement — correct |
| Status Code (success) | PASS - `200 OK` | Updated task returned |
| Status Code (not found) | PASS - `404 Not Found` | Resource does not exist |
| Status Code (invalid body) | PASS - `422 Unprocessable Entity` | Missing required fields |

### 3.5 `PATCH /tasks/:id` — Partial Update

| Check | Status | Detail |
|-------|--------|--------|
| HTTP Verb | PASS - `PATCH` | Partial update (not full replace) — correct |
| Status Code (success) | PASS - `200 OK` | Updated task returned |
| Status Code (empty body) | PASS - `400 Bad Request` | Explicit error for empty PATCH body |
| Status Code (not found) | PASS - `404 Not Found` | Clear error message |

### 3.6 `DELETE /tasks/:id` — Delete a Task

| Check | Status | Detail |
|-------|--------|--------|
| HTTP Verb | PASS - `DELETE` | Idempotent delete — correct |
| Status Code (success) | PASS - `204 No Content` | Deleted; no body returned (correct REST practice) |
| Status Code (not found) | PASS - `404 Not Found` | Task does not exist |

---

## 4. HATEOAS Awareness — Level 3 Preview

> **Note:** Full HATEOAS implementation is **not required** for this assignment.  
> The JSON structures below demonstrate what Level 3 responses would look like.

### 4.1 What is HATEOAS?

**HATEOAS** (Hypermedia As The Engine Of Application State) means the API response itself tells the client what actions are available next — eliminating the need to hard-code URLs in client applications. The client only needs to know the entry point (`/`), and navigates entirely through embedded links.

### 4.2 Task Response with `_links` (Level 3 Target)

The following is the JSON structure returned by our API (awareness-level implementation):

```json
{
  "success": true,
  "data": {
    "id": "1a2b3c4d-0001",
    "title": "Design Database Schema",
    "description": "Design the relational schema for the task management app.",
    "status": "completed",
    "priority": "high",
    "createdAt": "2026-10-01T09:00:00.000Z",
    "updatedAt": "2026-10-05T11:00:00.000Z",
    "_links": {
      "self":   { "href": "/tasks/1a2b3c4d-0001", "method": "GET"    },
      "update": { "href": "/tasks/1a2b3c4d-0001", "method": "PUT"    },
      "patch":  { "href": "/tasks/1a2b3c4d-0001", "method": "PATCH"  },
      "delete": { "href": "/tasks/1a2b3c4d-0001", "method": "DELETE" },
      "all":    { "href": "/tasks",                "method": "GET"    }
    }
  }
}
```

### 4.3 Two Required `_links` (Minimum Level 3 Awareness)

As specified in the assignment, the **two links** I would add to every task response body to target Level 3:

| Link Relation | URI | Purpose |
|---------------|-----|---------|
| `self` | `/tasks/123` | Points the client to the canonical URL of this specific task — enables re-fetching or referencing the resource without prior knowledge of the URL structure. |
| `delete` | `/tasks/123` | Tells the client exactly where and how to remove this task — the client does not need to construct the DELETE URL; it reads it from the response. |

**Minimal HATEOAS example (as given in assignment):**

```json
{
  "id": "123",
  "title": "Task A",
  "_links": {
    "self":   "/tasks/123",
    "delete": "/tasks/123"
  }
}
```

---

## 5. Level 2 Violations Found and Fixed

During evaluation, the following issues were identified and corrected in `routes/tasks.js`:

| # | Violation | Original (Bad Practice) | Fix Applied |
|---|-----------|------------------------|-------------|
| 1 | Using `GET` for create | `GET /tasks/create?title=...` | Changed to `POST /tasks` |
| 2 | Using `GET` for delete | `GET /tasks/delete/:id` | Changed to `DELETE /tasks/:id` |
| 3 | Always returning `200` | `res.status(200)` even on creation | `201 Created` for `POST`, `204 No Content` for `DELETE` |
| 4 | No `404` on missing resource | Returned empty object `{}` | Now returns `404 Not Found` with clear message |
| 5 | No input validation | Invalid data silently accepted | `422 Unprocessable Entity` with error details |
| 6 | Missing `Location` header | Not present on `POST` | Added `Location: /tasks/<id>` on `201 Created` |

---

## 6. Why Most Production APIs Stop at Level 2

Most real-world production APIs — including those from Twitter, GitHub, and Stripe — deliberately target **Level 2** of the Richardson Maturity Model rather than advancing to Level 3 (HATEOAS). The primary reason is **practicality vs. theoretical purity**.

**Level 2 provides everything a client genuinely needs:** resource-based URIs, correct HTTP semantics, and expressive status codes. These three features cover 99% of real API interactions. Clients — whether web front-ends, mobile apps, or third-party integrators — are typically built with a **pre-agreed contract** (documented in OpenAPI/Swagger specs or Postman collections) rather than dynamically discovering endpoints from hypermedia links at runtime.

**Level 3 HATEOAS introduces significant overhead** with limited practical gain: every response must embed navigational links (bloating payload size), clients must implement link-traversal logic instead of direct URL construction, and the "discoverability" benefit applies mainly to generic hypermedia clients — which rarely exist in production ecosystems. The added complexity in both server implementation and client parsing often outweighs the flexibility benefit.

Furthermore, industry tooling — including OpenAPI generators, API gateways, and SDK auto-generators — is optimised for Level 2 APIs. A well-documented Level 2 API is effectively as discoverable as a Level 3 API, because its contract is published in a machine-readable specification rather than embedded in response bodies at runtime.

**In summary:** Level 2 strikes the optimal balance between REST correctness, developer experience, tooling support, and implementation cost — which is why it has become the de facto standard for production REST APIs.

---

## 7. File Structure

```
Assignment_W4/
+-- server.js              # Express app entry point
+-- package.json           # Project dependencies
+-- MATURITY.md            # This evaluation document
+-- models/
|   +-- taskModel.js       # In-memory task store with CRUD operations
+-- routes/
    +-- tasks.js           # Level-2 RESTful route handlers
```

---

## 8. How to Run

```bash
# Install dependencies
npm install

# Start the server (production)
npm start

# Start with auto-reload (development)
npm run dev
```

API is available at: `http://localhost:3000`

---

## 9. References

- Richardson, L., and Ruby, S. (2007). *RESTful Web Services*. O'Reilly Media.
- Fowler, M. (2010). *Richardson Maturity Model*. martinfowler.com.
- Fielding, R. T. (2000). *Architectural Styles and the Design of Network-based Software Architectures* (Doctoral dissertation). UC Irvine.
- MDN Web Docs — HTTP Status Codes: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
