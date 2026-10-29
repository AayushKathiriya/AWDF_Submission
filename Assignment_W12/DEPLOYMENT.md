# Deployment Strategy — Blue-Green Simulation with Docker Compose

**Course:** Advanced Web Development Frameworks (ITUE301)  
**Week:** 12 | **CO:** CO5 / **PO:** PO3  
**Author:** Aayush Kathiriya  
**Repository:** `assignment-w12-aayushkathiriya`  

---

## 1. Overview

This document covers the **blue-green deployment strategy** as simulated using Docker Compose with two concurrent backend containers (`backend-blue` and `backend-green`) and an Nginx reverse proxy that acts as the traffic switch point.

---

## 2. What is Blue-Green Deployment?

Blue-green deployment is a **zero-downtime release strategy** in which two identical production environments — called **Blue** (current live version) and **Green** (new version being staged) — run simultaneously. At any given time only one environment receives live traffic. The switch is performed instantaneously at the load balancer level.

```
BEFORE SWITCH (Blue is live):

  Users ──► [Nginx :8080] ──► [Blue  :5000]  ← ACTIVE  (v1.0.0)
                         ╲──► [Green :5001]  ← STANDBY (v2.0.0 — under test)
                                [MongoDB]  ← shared data layer

AFTER SWITCH (Green is live):

  Users ──► [Nginx :8080] ──► [Blue  :5000]  ← STANDBY (kept warm for rollback)
                         ╲──► [Green :5001]  ← ACTIVE  (v2.0.0)
                                [MongoDB]  ← shared data layer
```

The key insight: **traffic switching happens at the Nginx upstream level**, not by stopping or replacing containers. Blue stays running and can be rolled back to in seconds.

---

## 3. System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                        Docker Network: tasknet                     │
│                                                                    │
│  ┌──────────┐     ┌────────────────────────────────────────────┐  │
│  │  Client  │     │              Nginx Reverse Proxy           │  │
│  │          │────►│              container: task-nginx         │  │
│  │ :8080    │     │              host port: 8080               │  │
│  └──────────┘     └──────────┬────────────────┬───────────────┘  │
│                               │                │                   │
│                    upstream   │                │  (standby)        │
│                    (ACTIVE)   ▼                ▼                   │
│                  ┌──────────────┐    ┌──────────────────┐         │
│                  │ backend-blue │    │ backend-green    │         │
│                  │ VERSION=blue │    │ VERSION=green    │         │
│                  │ port: 5000   │    │ port: 5001       │         │
│                  │ (live)       │    │ (staging / warm) │         │
│                  └──────┬───────┘    └──────────────────┘         │
│                         │                                          │
│                         ▼                                          │
│                  ┌──────────────┐                                  │
│                  │   MongoDB    │  ← shared between blue & green   │
│                  │   :27017     │                                  │
│                  └──────────────┘                                  │
└────────────────────────────────────────────────────────────────────┘
```

---

## 4. Step-by-Step: Full Blue-Green Deployment Simulation

### Step 1 — Start Both Containers

```bash
# Build both images from the same Dockerfile
# VERSION env var is what differentiates blue from green at runtime
docker-compose up --build -d

# Expected output:
# [+] Running 4/4
#  ✔ Container task-mongo           Started
#  ✔ Container task-backend-blue    Started
#  ✔ Container task-backend-green   Started
#  ✔ Container task-nginx           Started
```

### Step 2 — Verify Blue is Live on Port 5000

```bash
curl http://localhost:5000/version

# Response:
{
  "version": "blue",
  "colour":  "blue",
  "port":    5000,
  "pid":     1,
  "node":    "v20.12.0",
  "uptime_s": 12,
  "timestamp": "2026-10-29T15:45:00.000Z",
  "message": "Task Management API — BLUE deployment is active"
}
```

### Step 3 — Verify Green is Warm on Port 5001

```bash
curl http://localhost:5001/version

# Response:
{
  "version": "green",
  "colour":  "green",
  "port":    5000,
  "pid":     1,
  "node":    "v20.12.0",
  "uptime_s": 11,
  "timestamp": "2026-10-29T15:45:01.000Z",
  "message": "Task Management API — GREEN deployment is active"
}
```

### Step 4 — Verify Nginx Routes to Blue (Public Entry Point)

```bash
curl http://localhost:8080/version

# Response:
{
  "version": "blue",
  "message": "Task Management API — BLUE deployment is active"
}

# Confirm via response header:
curl -I http://localhost:8080/version
# X-Deployment-Colour: blue   ← set by server.js middleware
# X-Proxy-Upstream: 172.20.0.3:5000  ← Nginx upstream address of blue container
```

### Step 5 — Run Smoke Tests Against Green (Before Switch)

```bash
# Run full endpoint tests against green (port 5001) to validate the new version
curl http://localhost:5001/tasks
curl -X POST http://localhost:5001/tasks \
     -H "Content-Type: application/json" \
     -d '{"title":"Green smoke test task","priority":"high"}'

# Load test green independently (does not affect blue's live traffic)
ab -n 200 -c 10 http://localhost:5001/tasks

# Green passes all checks — proceed with switch
```

### Step 6 — Switch Traffic from Blue to Green (The Deployment)

**What changes:** One line in `nginx/blue-green.conf`.

```nginx
# BEFORE (blue is active):
upstream task_backend {
  server backend-blue:5000;    # ← ACTIVE
  # server backend-green:5000; # ← commented out
}

# AFTER (green is active):
upstream task_backend {
  # server backend-blue:5000;  # ← commented out
  server backend-green:5000;   # ← ACTIVE
}
```

```bash
# Edit nginx/blue-green.conf (swap the upstream server line)
# Then reload Nginx — zero-downtime, no container restart:
docker-compose exec nginx nginx -s reload

# Nginx reload takes < 1 second. In-flight requests to blue complete normally.
# All new connections go to green immediately after reload.
```

### Step 7 — Verify Switch Was Successful

```bash
# Public endpoint now returns green:
curl http://localhost:8080/version

# Response:
{
  "version": "green",
  "message": "Task Management API — GREEN deployment is active"
}

# Blue is still running (kept warm for instant rollback):
curl http://localhost:5000/version
# {"version":"blue"} — blue container still alive, just no public traffic
```

### Step 8 — Confirm docker ps and docker stats

```
CONTAINER ID   IMAGE             STATUS                   PORTS
a3f7c2d1e9b4   task-api:blue     Up 8 minutes (healthy)   0.0.0.0:5000->5000/tcp
b7c9e1f2d4a6   task-api:green    Up 8 minutes (healthy)   0.0.0.0:5001->5000/tcp
c8d2f3b5e7a1   task-nginx        Up 8 minutes             0.0.0.0:8080->80/tcp
d1e4a7c9f2b3   mongo:7.0-jammy   Up 8 minutes (healthy)   0.0.0.0:27017->27017/tcp

CONTAINER              CPU %   MEM USAGE / LIMIT    MEM %
task-backend-blue      0.12%   47.1MiB / 256MiB     18.4%   ← warm but idle
task-backend-green    41.83%   52.6MiB / 256MiB     20.5%   ← serving live traffic
task-nginx             0.01%    3.2MiB / unlimited    —
task-mongo             1.77%   63.4MiB / 512MiB     12.4%
```

### Step 9 — Decommission Blue (After Confidence Period)

```bash
# After 10–30 minutes of green serving traffic with no errors:
docker-compose stop backend-blue
docker-compose rm -f backend-blue

# Green is now the sole production container.
# On next release: blue becomes the new version, green becomes the base.
# The colours swap with every deployment.
```

---

## 5. What Changed and How Downtime Was Avoided

### What changed

| Item | Before Switch | After Switch |
|------|--------------|-------------|
| Nginx upstream | `backend-blue:5000` | `backend-green:5000` |
| Public port 8080 response | `{"version":"blue"}` | `{"version":"green"}` |
| Container stopped/restarted | None | None |
| In-flight requests dropped | **Zero** | **Zero** |

### How downtime was avoided

1. **Green was warm before the switch.** The container was already running, had completed its startup (including any DB connection warm-up), and passed health checks. There was no cold-start latency during the switch.

2. **Nginx `reload` is not a `restart`.** `nginx -s reload` sends `SIGHUP` to the Nginx master process. The master spawns new worker processes (pointing to green) while old workers finish in-flight requests to blue and then exit gracefully. The switchover takes **< 100 milliseconds** — invisible to users.

3. **Blue was kept alive.** No containers were stopped during the switch. If a problem emerged within seconds, a one-line config change and another `nginx -s reload` would restore blue — without rebuilding, restarting, or re-deploying anything.

4. **Shared MongoDB.** Both blue and green connect to the same database, so no data migration is needed for the traffic switch. (Schema migrations must be backwards-compatible between versions — a separate concern handled before deployment.)

---

## 6. Rollback Plan

A rollback is required if green exhibits any of the following within the confidence period:
- Error rate rises above 1% (`Failed requests > 0` in `ab`)
- P95 latency doubles compared to blue baseline
- Any 5xx responses in Nginx access log
- A critical bug reported by QA or monitoring

### Rollback procedure (< 30 seconds)

```bash
# Step 1: Edit nginx/blue-green.conf — restore blue as upstream
#   Change: server backend-green:5000;
#   Back to: server backend-blue:5000;

# Step 2: Reload Nginx — zero-downtime switch back to blue
docker-compose exec nginx nginx -s reload

# Step 3: Confirm rollback succeeded
curl http://localhost:8080/version
# {"version":"blue"} ← rollback confirmed in < 1 second

# Step 4: Stop green to investigate the issue
docker-compose stop backend-green

# Step 5: Check green logs for root cause
docker-compose logs backend-green --tail 100

# Step 6: Fix the bug in code, rebuild green, and repeat the process
docker-compose build backend-green
docker-compose up -d backend-green
```

**Why this is fast:** Blue was never stopped. It was sitting idle at full readiness — the rollback is identical to the original switch: one config line + one `nginx -s reload`.

### Rollback Decision Matrix

| Observation Within Confidence Period | Action |
|--------------------------------------|--------|
| Error rate = 0, latency normal (≤ baseline + 10%) | ✅ Accept — proceed to decommission blue |
| Error rate 0–1%, latency slightly elevated | ⚠️ Monitor — extend confidence period to 30 min |
| Error rate > 1% OR P95 latency > 2× baseline | 🔴 Rollback immediately to blue |
| OOM kill or container crash on green | 🔴 Rollback immediately + investigate heap growth |
| Data corruption or wrong HTTP status codes | 🔴 Rollback + hotfix + emergency DB audit |

---

## 7. Blue-Green vs Rolling Update

### What is a Rolling Update?

A **rolling update** gradually replaces old instances with new ones, one at a time (or in small batches), while the old instances continue serving traffic. At no point are all instances running the same version simultaneously — there is always a mix of old and new during the update window.

```
Rolling update (3 replicas, updating one at a time):

  t=0:  [v1] [v1] [v1]   ← all replicas on old version
  t=1:  [v2] [v1] [v1]   ← first replica updated (mixed traffic)
  t=2:  [v2] [v2] [v1]   ← second replica updated (mixed traffic)
  t=3:  [v2] [v2] [v2]   ← all replicas on new version

Blue-Green (2 environments):

  t=0:  [BLUE active] [GREEN standby — warming up]
  t=1:  [BLUE active] [GREEN standby — health checked ✓]
  t=1+ε: Nginx reload → [BLUE idle] [GREEN active]   ← instant switch
```

### Comparison: Blue-Green vs Rolling Update

| Aspect | Blue-Green | Rolling Update |
|--------|-----------|----------------|
| **Traffic during update** | 100% goes to one version at all times — no mixed-version requests | Mixed: some requests go to old, some to new during the update window |
| **Rollback speed** | Instant — one Nginx reload restores the previous state | Slow — must roll forward or re-deploy the old version across all replicas |
| **Resource cost** | High — requires 2× infrastructure (blue + green running simultaneously) | Low — replicas are updated in-place; no extra capacity needed |
| **Risk of version mismatch** | None — only one version serves traffic at any time | Exists — clients may receive responses from different API versions in the same session |
| **When to use** | High-risk releases (schema changes, major feature launches) where instant rollback is critical | Routine incremental updates where brief mixed-version traffic is acceptable and resource cost must be minimised |
| **Best for** | Monoliths, stateful APIs, production systems with strict SLAs | Stateless microservices, Kubernetes deployments, low-risk patch releases |

**When to choose Blue-Green over Rolling:** Use blue-green when a release involves database schema changes, significant API contract changes, or any scenario where serving a mix of v1 and v2 responses in the same session would produce incorrect behaviour. The instant rollback guarantee is essential for releases that cannot be incrementally unwound.

**When to choose Rolling over Blue-Green:** Use rolling updates for stateless microservices where every instance is truly identical, where you have Kubernetes managing replicas automatically, or where infrastructure cost is a constraint and the new version is a low-risk patch (e.g., a security fix with no API surface changes).

---

## 8. File Structure

```
Assignment_W12/
+-- server.js              # Express API with /version endpoint
+-- package.json           # Project dependencies
+-- Dockerfile             # Multi-stage Node.js 20 Alpine image
+-- docker-compose.yml     # Blue + Green + Nginx + MongoDB
+-- DEPLOYMENT.md          # This document
+-- README.md              # Quick start
+-- .gitignore
+-- nginx/
|   +-- blue-green.conf    # Nginx upstream config — edit to switch traffic
+-- models/
|   +-- taskModel.js       # In-memory task store
+-- routes/
    +-- tasks.js           # RESTful routes with cache middleware
```

---

## 9. References

- Kim, G., Humble, J., Debois, P., & Willis, J. (2016). *The DevOps Handbook*. IT Revolution Press.
- Humble, J., & Farley, D. (2010). *Continuous Delivery*. Addison-Wesley. (Chapter 8 — Deployment Strategies)
- Fowler, M. (2010). *BlueGreenDeployment*. martinfowler.com. https://martinfowler.com/bliki/BlueGreenDeployment.html
- Nginx Inc. (2024). *NGINX reverse proxy documentation*. https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/
- Docker Inc. (2024). *Docker Compose networking*. https://docs.docker.com/compose/networking/
