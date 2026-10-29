# Assignment W12 — Blue-Green Deployment Simulation with Docker Compose

**Course:** Advanced Web Development Frameworks (ITUE301)  
**Week:** 12 | **CO:** CO5 / **PO:** PO3  
**Author:** Aayush Kathiriya  

## About

Simulates a **zero-downtime blue-green deployment** using Docker Compose with two concurrent backend containers and Nginx as the traffic switch point.

## Key Deliverables

| File | Description |
|------|-------------|
| `DEPLOYMENT.md` | Full process documentation, rollback plan, Blue-Green vs Rolling comparison |
| `docker-compose.yml` | `backend-blue` (port 5000) + `backend-green` (port 5001) + Nginx + MongoDB |
| `server.js` | Updated with `GET /version` endpoint returning `process.env.VERSION` |
| `Dockerfile` | Multi-stage Alpine image (same image, different env var = different colour) |
| `nginx/blue-green.conf` | Upstream config — edit one line + `nginx -s reload` to switch traffic |

## Quick Start

```bash
# Build and launch the full blue-green stack
docker-compose up --build -d

# Verify blue is live (direct)
curl http://localhost:5000/version   # {"version":"blue"}

# Verify green is warm (direct)
curl http://localhost:5001/version   # {"version":"green"}

# Verify Nginx routes to blue (public entry)
curl http://localhost:8080/version   # {"version":"blue"}
```

## Traffic Switch (Blue → Green)

```bash
# 1. Edit nginx/blue-green.conf:
#    Comment out:   server backend-blue:5000;
#    Uncomment:     server backend-green:5000;

# 2. Reload Nginx (zero-downtime — < 100ms)
docker-compose exec nginx nginx -s reload

# 3. Verify
curl http://localhost:8080/version   # {"version":"green"} ✓
```

## Rollback (Green → Blue)

```bash
# Revert nginx/blue-green.conf to backend-blue:5000
docker-compose exec nginx nginx -s reload
curl http://localhost:8080/version   # {"version":"blue"} ✓
```

## Port Map

| Port | Container | Status |
|------|-----------|--------|
| `8080` | Nginx (public) | Active — currently routing to BLUE |
| `5000` | backend-blue | **ACTIVE** (live traffic) |
| `5001` | backend-green | Standby (smoke tests, warm) |
| `27017` | MongoDB | Shared by both |
