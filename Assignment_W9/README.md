# Assignment W9 — Performance Load Testing with Apache Bench

**Course:** Advanced Web Development Frameworks (ITUE301)  
**Week:** 9 | **CO:** CO4 / **PO:** PO3  
**Author:** Aayush Kathiriya  

## About

Performance load testing of the Task Management REST API using **Apache Bench (ab)**.  
Tests compare RPS, latency, and error rate for `GET /tasks` **with and without** `node-cache` caching.

## Key Deliverables

| File | Description |
|------|-------------|
| `LOADTEST.md` | Full ab output, comparison table, and scalability analysis |
| `server.js` | Express server with node-cache (TTL = 120s) integration |
| `routes/tasks.js` | RESTful routes — cache middleware on GET /tasks |
| `models/taskModel.js` | In-memory task store (25 pre-seeded tasks) |
| `scripts/seed.js` | Seeds 25 additional tasks via HTTP POST |

## Quick Start

```bash
npm install
npm start           # API on http://localhost:5000
npm run seed        # Add 25 more tasks (optional, for 50 total)
```

## Load Test Results Summary

| Metric            | Without Cache | With Cache   | Improvement |
|-------------------|---------------|--------------|-------------|
| RPS               | 51.99 req/s   | 325.73 req/s | +527%       |
| Mean Latency (ms) | 192.34 ms     | 30.70 ms     | -84%        |
| Failed Requests   | 0             | 0            | —           |

> See `LOADTEST.md` for full raw output, P95/P99 latencies, and high-concurrency (`-c 50`) results.

## Cache Routes

| Method   | Endpoint        | Description              |
|----------|-----------------|--------------------------|
| GET      | `/cache/status` | Hit/miss stats           |
| DELETE   | `/cache`        | Manually flush the cache |
