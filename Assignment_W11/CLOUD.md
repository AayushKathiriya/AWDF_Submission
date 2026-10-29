# Cloud Service Models & Docker Resource Limits

**Course:** Advanced Web Development Frameworks (ITUE301)  
**Week:** 11 | **CO:** CO5 / **PO:** PO3  
**Author:** Aayush Kathiriya  
**Repository:** `assignment-w11-aayushkathiriya`  

---

## 1. Overview

This document covers three cloud service models (IaaS, PaaS, Serverless), maps the current Docker Compose setup to the closest model, and documents the effect of applying CPU and memory resource limits to the Task Management API container.

---

## 2. Cloud Service Model Comparison

### 2.1 Responsibility Stack (Who Manages What)

The key difference between cloud models is **how much the provider manages** versus **how much you manage**:

```
                     IaaS          PaaS          Serverless
                  ┌─────────┐   ┌─────────┐   ┌─────────────┐
Application       │  YOU    │   │  YOU    │   │    YOU      │
                  ├─────────┤   ├─────────┤   ├─────────────┤
Runtime / Node.js │  YOU    │   │ PROVIDER│   │  PROVIDER   │
                  ├─────────┤   ├─────────┤   ├─────────────┤
Middleware / OS   │  YOU    │   │ PROVIDER│   │  PROVIDER   │
                  ├─────────┤   ├─────────┤   ├─────────────┤
Virtualisation    │PROVIDER │   │ PROVIDER│   │  PROVIDER   │
                  ├─────────┤   ├─────────┤   ├─────────────┤
Servers / Network │PROVIDER │   │ PROVIDER│   │  PROVIDER   │
                  ├─────────┤   ├─────────┤   ├─────────────┤
Storage / Hardware│PROVIDER │   │ PROVIDER│   │  PROVIDER   │
                  └─────────┘   └─────────┘   └─────────────┘
```

### 2.2 Three-Column Comparison Table

| Aspect | IaaS (Infrastructure as a Service) | PaaS (Platform as a Service) | Serverless (FaaS) |
|--------|-------------------------------------|------------------------------|-------------------|
| **Definition** | Provider supplies raw virtual machines, networking, and storage. You install and manage everything on top. | Provider supplies a managed runtime, OS, and middleware. You deploy your application code and config. | Provider manages everything including runtime scaling. You deploy individual functions that run on-demand. |
| **You Manage** | OS, runtime (Node.js), app server, middleware, app code, scaling policy | App code, environment variables, build configuration | Only business logic (function code). No servers, no OS, no runtime to manage. |
| **Provider Manages** | Physical hardware, network, virtualisation layer (hypervisor) | OS patches, runtime upgrades, load balancing, server provisioning | Everything: hardware, OS, runtime, auto-scaling, availability |
| **Scaling** | Manual — you configure auto-scaling groups or spin up extra VMs | Semi-automatic — provider scales instances; you set max/min limits | Fully automatic — scales from 0 to thousands of instances per second |
| **Billing Model** | Pay-per-hour for running VMs (even if idle) | Pay per instance/dyno (running time, even if no traffic) | Pay-per-invocation + execution duration. Zero cost when idle. |
| **Startup Latency** | Fast (VM already running) | Fast (container already running) | Cold start: 200ms–2s for first invocation after idle period |
| **Example Providers** | AWS EC2, Azure Virtual Machines, Google Compute Engine, DigitalOcean Droplets | Heroku, AWS Elastic Beanstalk, Google App Engine, Railway, Render | AWS Lambda, Azure Functions, Google Cloud Functions, Vercel, Cloudflare Workers |
| **Typical Use Case** | Full control needed; legacy apps; GPU workloads; custom OS configuration | Web apps and APIs where you want to focus on code, not servers | Event-driven workloads, webhooks, scheduled jobs, low-traffic APIs |
| **Task Management API Fit** | ✅ Good fit — full Docker control; port 5000 exposed; your own Nginx config | ✅ Good fit — deploy to Heroku/Render with `Procfile`; minimal config | ⚠️ Partial fit — CRUD routes work; but persistent in-memory cache doesn't survive cold starts |
| **Stateless Requirement** | Not required (VMs are persistent) | Recommended (dyno restarts; ephemeral filesystem) | **Mandatory** — function instances are stateless; no shared memory between invocations |
| **DevOps Overhead** | High — you manage patching, backups, scaling configs | Medium — you manage app config; provider handles infrastructure | Low — no server management; but debugging cold starts and timeouts is complex |

---

## 3. Docker Compose Mapping to Cloud Model

### 3.1 Which Cloud Model Does Docker Compose Represent?

**Docker Compose maps most closely to IaaS.**

When you run `docker-compose up` on a local machine (or a VM on AWS EC2 / DigitalOcean), you are:

- **Provisioning your own runtime environment** — writing the `Dockerfile` to specify Node.js version, OS base image (`node:20-alpine`), and dependencies. This mirrors installing a runtime on a VM.
- **Managing the network** — defining service names, exposed ports (`5000:5000`), and inter-container links (`backend` → `mongo`) yourself in `docker-compose.yml`.
- **Controlling the process lifecycle** — `restart: unless-stopped`, health checks, and `depends_on` are all configurations you write, just as you would configure `systemd` services on a VM.
- **Setting resource limits** — explicitly specifying CPU (`cpus: "0.50"`) and memory (`mem_limit: 256m`) mirrors the way you would size a VM instance on AWS EC2 (e.g., choosing `t3.micro` for 1 vCPU / 1 GB RAM).

A **PaaS** (like Heroku) would remove the `Dockerfile` entirely — you push code and the platform handles the container build, runtime selection, and networking. With Docker Compose, all of that responsibility remains with you: the developer.

```
Analogy:
  IaaS (EC2 + your Dockerfile)  ≈  docker-compose on your local machine
  PaaS (Heroku)                 ≈  git push heroku main  (no Dockerfile needed)
  Serverless (Lambda)           ≈  zip function code + upload + invoke by event
```

---

## 4. Docker Compose Configuration with Resource Limits

### 4.1 File: `docker-compose.yml`

The full compose file (see project root) includes `mem_limit` and `cpus` applied at the service level for compatibility with both Compose v3 standalone and Swarm mode.

**Key resource limit configuration:**

```yaml
# Compose v3 Swarm-compatible syntax (deploy.resources):
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: "0.50"
          memory: 256M
        reservations:
          memory: 128M

# Compose standalone syntax (top-level, works without Swarm):
services:
  backend:
    mem_limit: 256m
    cpus: 0.50
    memswap_limit: 256m   # disable swap so OOM kill triggers correctly
```

> **Note:** `deploy.resources` is only honoured when using `docker stack deploy` (Swarm mode).  
> For plain `docker-compose up`, use `mem_limit` and `cpus` at the service level (top-level keys).  
> The `docker-compose.yml` in this assignment uses **both** so it works in either mode.

### 4.2 What the Limits Mean

| Parameter | Value | Meaning |
|-----------|-------|---------|
| `cpus: "0.50"` | 0.50 | Container may use at most 50% of one CPU core. On a 4-core host, this is 12.5% of total CPU. |
| `mem_limit: 256m` | 256 MB | Hard memory ceiling. If the container tries to allocate beyond this, the Linux OOM killer terminates the process. |
| `memswap_limit: 256m` | 256 MB | Set equal to `mem_limit` to disable swap usage. Container cannot swap to disk when RAM is full. |
| `reservations.memory: 128M` | 128 MB | Swarm scheduler guarantees this much memory is available on the host before scheduling the container. |

---

## 5. Running the Stack and Verifying Limits

### 5.1 Commands

```bash
# Build images and start all services with limits applied
docker-compose up --build -d

# Verify resource limits are applied (live stats)
docker stats

# Filter to backend container only
docker stats task-backend

# Inspect actual limits set on the container
docker inspect task-backend --format '{{.HostConfig.Memory}} {{.HostConfig.NanoCpus}}'
# Output: 268435456  500000000
# 268435456 bytes = 256 MB  |  500000000 nanocpus = 0.5 CPUs ✓

# Check container health
docker-compose ps

# Stop all services
docker-compose down
```

### 5.2 Docker Stats Output

The following output was captured from `docker stats` after running `docker-compose up --build` and seeding 50 task documents:

```
CONTAINER ID   NAME              CPU %   MEM USAGE / LIMIT   MEM %   NET I/O          BLOCK I/O     PIDS
a3f7c2d1e9b4   task-backend      8.24%   47.3MiB / 256MiB    18.47%  1.24MB / 3.87MB  0B / 16.4kB   11
d8b1f4a2c7e5   task-mongo        2.11%   61.8MiB / 512MiB    12.07%  3.87MB / 1.24MB  2.1MB / 0B    28

--- After running: ab -n 200 -c 10 http://localhost:5000/tasks ---

CONTAINER ID   NAME              CPU %    MEM USAGE / LIMIT   MEM %   NET I/O           BLOCK I/O     PIDS
a3f7c2d1e9b4   task-backend      43.67%   52.1MiB / 256MiB    20.35%  6.82MB / 19.4MB   0B / 16.4kB   11
d8b1f4a2c7e5   task-mongo        4.88%    63.2MiB / 512MiB    12.34%  19.4MB / 6.82MB   2.1MB / 4.1kB 28

--- Peak load (ab -n 200 -c 50): CPU throttled at limit ---

CONTAINER ID   NAME              CPU %    MEM USAGE / LIMIT   MEM %   NET I/O           BLOCK I/O     PIDS
a3f7c2d1e9b4   task-backend      49.98%   58.9MiB / 256MiB    23.01%  14.7MB / 42.3MB   0B / 16.4kB   14
d8b1f4a2c7e5   task-mongo        7.23%    65.1MiB / 512MiB    12.71%  42.3MB / 14.7MB   2.1MB / 8.3kB 28
```

### 5.3 Observations from docker stats

| Observation | Detail |
|-------------|--------|
| **CPU cap enforced** | During the `-c 50` load test, CPU peaked at **49.98%** — just under the 50% limit. The kernel CFS scheduler throttled the container before it could exceed 0.5 CPUs. |
| **Memory well within limit** | Peak memory was **58.9 MiB / 256 MiB (23%)** — Node.js is efficient at this workload; the 256 MB limit is safe. Increasing to `-c 100` or seeding larger payloads would push this higher. |
| **No OOM kills observed** | `docker inspect task-backend --format "{{.State.OOMKilled}}"` returned `false` for all tests. |
| **PIDS increased under load** | Worker threads/handles went from 11 (idle) to 14 (peak) — still well within Node.js single-process norms. |

---

## 6. OOM Kill — What It Means for Reliability

### 6.1 What is OOM Kill?

**OOM (Out of Memory) Kill** is the Linux kernel's emergency response to a container exceeding its memory limit. When a container's memory usage reaches `mem_limit` and no swap is available (`memswap_limit` = `mem_limit`), the kernel's **OOM Killer** selects a process inside the container and sends it `SIGKILL` — terminating it immediately without cleanup.

```
Timeline of an OOM Kill event:

  Container starts           Memory grows             Limit reached
  ─────────────             ──────────────           ──────────────
  [Node.js starts]   →   [Requests pile up]   →   [256 MB ceiling hit]
  Memory: 48 MB           Memory: 240 MB           Memory: 256 MB
                                                         │
                                                         ▼
                                              ┌─────────────────────┐
                                              │   Linux OOM Killer  │
                                              │  SIGKILL → pid 1    │
                                              │  (Node.js process)  │
                                              └─────────────────────┘
                                                         │
                                                         ▼
                                              Container exits (code 137)
                                              docker-compose restart policy
                                              triggers restart
```

### 6.2 Impact on API Reliability

| Scenario | Effect |
|----------|--------|
| **OOM Kill with `restart: unless-stopped`** | Container restarts automatically. There is a brief downtime (typically 2–5 seconds) during which all in-flight requests fail with connection reset errors. In-memory cache is wiped on restart. |
| **OOM Kill in a Kubernetes Pod** | Pod is restarted by the kubelet. If `restartPolicy: Always`, the pod comes back. The OOMKilled reason is visible in `kubectl describe pod`. |
| **OOM Kill in Production (no restart policy)** | Container exits; the API goes dark until an operator or orchestrator brings it back. This is a **reliability incident**. |
| **OOM Kill with node-cache (Week 9 setup)** | The in-memory cache is completely lost on restart. The first request after recovery triggers a cache MISS and hits the task store directly — temporarily increasing latency. |

### 6.3 Prevention Strategies

```
1. Right-size limits:      Profile real usage (docker stats) before setting limits.
                           Never set mem_limit below observed peak + 30% headroom.

2. External cache (Redis): Move node-cache to Redis so cache survives container restart.

3. Horizontal scaling:     Run 2+ replicas. OOM kill on one instance does not
                           affect others behind the load balancer.

4. Memory leak detection:  Use --inspect + Chrome DevTools heap snapshots, or
                           clinic.js heapProfiler to catch leaks before they OOM.

5. Liveness probes:        In Kubernetes, configure livenessProbe so containers
                           that are stuck (not OOM but deadlocked) are also restarted.
```

---

## 7. File Structure

```
Assignment_W11/
+-- docker-compose.yml     # Full stack: backend + mongo, with resource limits
+-- Dockerfile             # Multi-stage Node.js 20 Alpine image
+-- CLOUD.md               # This document
+-- README.md              # Quick start guide
+-- .gitignore             # Excludes node_modules, .env
+-- docs/
    +-- docker-stats.txt   # Raw docker stats capture (text format)
```

---

## 8. Quick Start

```bash
# Build and start the stack with resource limits
docker-compose up --build -d

# Verify containers are running
docker-compose ps

# View live resource usage (Ctrl+C to exit)
docker stats

# Check if OOM kill occurred
docker inspect task-backend --format "OOMKilled: {{.State.OOMKilled}}"

# View backend logs
docker-compose logs -f backend

# Stop everything
docker-compose down
```

---

## 9. References

- Docker Inc. (2024). *Compose file reference — resources*. https://docs.docker.com/compose/compose-file/compose-file-v3/#resources
- Docker Inc. (2024). *Runtime options with Memory, CPUs, and GPUs*. https://docs.docker.com/config/containers/resource_constraints/
- Amazon Web Services. (2024). *Types of cloud computing*. https://aws.amazon.com/types-of-cloud-computing/
- Google Cloud. (2024). *IaaS, PaaS, and SaaS: cloud service model comparison*. https://cloud.google.com/learn/paas-vs-iaas-vs-saas
- Linux kernel documentation. (2024). *OOM killer*. https://www.kernel.org/doc/html/latest/admin-guide/mm/oom_killer.html
- NIST. (2011). *The NIST Definition of Cloud Computing* (SP 800-145). https://doi.org/10.6028/NIST.SP.800-145
