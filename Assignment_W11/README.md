# Assignment W11 — Cloud Service Models & Docker Resource Limits

**Course:** Advanced Web Development Frameworks (ITUE301)  
**Week:** 11 | **CO:** CO5 / **PO:** PO3  
**Author:** Aayush Kathiriya  

## About

Documents IaaS / PaaS / Serverless cloud service models and applies Docker CPU + memory resource limits to the Task Management API containerised stack.

## Key Deliverables

| File | Description |
|------|-------------|
| `CLOUD.md` | IaaS/PaaS/Serverless comparison, Docker Compose model mapping, resource limits docs, OOM kill analysis |
| `docker-compose.yml` | Full stack (backend + mongo) with `mem_limit`, `cpus`, and `deploy.resources` |
| `Dockerfile` | Multi-stage Node.js 20 Alpine image (non-root user, health check) |
| `docs/docker-stats.txt` | Captured `docker stats` output — idle, load test, high concurrency |

## Quick Start

```bash
# Build and launch with resource limits
docker-compose up --build -d

# Verify limits applied
docker stats

# Run load test (requires Apache Bench)
ab -n 200 -c 10 http://localhost:5000/tasks

# Check for OOM kills
docker inspect task-backend --format "OOMKilled: {{.State.OOMKilled}}"

# Stop all services
docker-compose down
```

## Resource Limits Applied

| Container | CPU Limit | Memory Limit | Memory Reservation |
|-----------|-----------|--------------|-------------------|
| `task-backend` | 0.50 vCPU | 256 MB | 128 MB |
| `task-mongo` | 1.00 vCPU | 512 MB | 256 MB |

## Cloud Model Mapping

> Docker Compose on a local machine / VM maps most closely to **IaaS**:  
> you write the Dockerfile (runtime), manage networks, ports, and resource limits —  
> just as you would configure a raw EC2 instance. A PaaS (Heroku/Render) would  
> abstract all of that away with a simple `git push`.
