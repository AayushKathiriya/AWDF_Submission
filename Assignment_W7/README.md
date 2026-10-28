# Assignment W7 - Security Hardening

**Course:** Advanced Web Development Frameworks (ITUE301)
**Week:** 7 | CO2, CO6 / PO3, PO10
**Author:** Aayush Kathiriya

## About

Security hardening of the Task Management REST API covering:
- STRIDE Threat Model analysis
- HTTPS/TLS with mkcert (local development)
- NoSQL injection prevention via express-mongo-sanitize

## Key Deliverables

| File | Description |
|------|-------------|
| `SECURITY.md` | Full STRIDE table, HTTPS vs JWT comparison, before/after sanitize test |
| `server.js` | Updated with mongoSanitize middleware + HTTPS server |
| `routes/tasks.js` | RESTful route handlers |
| `.gitignore` | Cert files excluded |

## Quick Start

```bash
npm install
mkcert -install && mkcert localhost
npm start
# HTTP  → http://localhost:3000
# HTTPS → https://localhost:5443
```

## Security Features

| Feature | Implementation |
|---------|---------------|
| NoSQL Injection Prevention | `express-mongo-sanitize` (before all routes) |
| HTTPS/TLS | mkcert local CA + `https.createServer()` on port 5443 |
| Security Headers | X-Content-Type-Options, X-Frame-Options, HSTS |
| Input Validation | Enum + type checks in route handlers |
