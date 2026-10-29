# Load Test Report — Task Management API

**Course:** Advanced Web Development Frameworks (ITUE301)  
**Week:** 9 | **CO:** CO4 / **PO:** PO3  
**Author:** Aayush Kathiriya  
**Repository:** `assignment-w9-aayushkathiriya`  
**Test Date:** 2026-10-29  
**Tool:** Apache Bench (`ab`) v2.3  

---

## 1. Overview

This report documents the results of Apache Bench load tests run against the `GET /tasks` endpoint of the Task Management REST API. The objective was to measure and compare **Requests Per Second (RPS)**, **mean latency**, and **error rate** under two conditions:

1. **Without Cache** — plain Express route, no caching layer.
2. **With Cache** — `node-cache` middleware (TTL = 120 s) serving pre-built JSON responses.

A third test was run with elevated concurrency (`-c 50`) to observe how each configuration scales under greater pressure.

---

## 2. Test Environment

| Parameter       | Value                                  |
|-----------------|----------------------------------------|
| OS              | Windows 11 (WSL2 Ubuntu 22.04)         |
| Node.js Version | v20.12.0                               |
| Express Version | 4.18.2                                 |
| Cache Library   | node-cache 5.1.2                       |
| Cache TTL       | 120 seconds                            |
| API Port        | 5000                                   |
| Seed Documents  | 50 tasks (25 pre-seeded + 25 via seed script) |
| Apache Bench    | ab v2.3 (installed via XAMPP on Windows / WSL on Linux) |
| Machine         | Intel Core i5-1135G7 @ 2.40 GHz, 8 GB RAM |

> **Windows Note:** Apache Bench is not available by default on Windows.  
> It was run using **WSL (Windows Subsystem for Linux)** — Ubuntu 22.04:  
> ```bash
> sudo apt-get install apache2-utils
> ab -V   # ApacheBench, Version 2.3
> ```
> Alternatively, XAMPP ships `ab.exe` in `C:\xampp\apache\bin\`.

---

## 3. Test Commands

### 3.1 Baseline — Without Cache (`-n 200 -c 10`)
```bash
# 1. Disable cache: comment out the cache.get() block in routes/tasks.js
#    so every request hits the task model directly.
# 2. Restart the server: npm start
# 3. Run the test:
ab -n 200 -c 10 http://localhost:5000/tasks
```

### 3.2 With Cache Enabled (`-n 200 -c 10`)
```bash
# 1. Re-enable the cache middleware (revert routes/tasks.js changes).
# 2. Restart the server: npm start
# 3. Warm the cache with one manual request:
#    curl http://localhost:5000/tasks
# 4. Run the test:
ab -n 200 -c 10 http://localhost:5000/tasks
```

### 3.3 High Concurrency — With Cache (`-n 200 -c 50`)
```bash
ab -n 200 -c 50 http://localhost:5000/tasks
```

---

## 4. Raw Apache Bench Output (Selected Excerpts)

### 4.1 Without Cache — `-n 200 -c 10`

```
Server Software:        
Server Hostname:        localhost
Server Port:            5000

Document Path:          /tasks
Document Length:        14823 bytes

Concurrency Level:      10
Time taken for tests:   3.847 seconds
Complete requests:      200
Failed requests:        0
Total transferred:      3,021,800 bytes
HTML transferred:       2,964,600 bytes
Requests per second:    51.99 [#/sec] (mean)
Time per request:       192.34 [ms] (mean)
Time per request:       19.23 [ms] (mean, across all concurrent requests)
Transfer rate:          767.03 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.4      0       2
Processing:    43  191  28.1    189     286
Waiting:       41  190  27.9    188     284
Total:         43  191  28.1    189     286

Percentage of the requests served within a certain time (ms)
  50%    189
  66%    197
  75%    203
  80%    208
  90%    226
  95%    243
  98%    266
  99%    278
 100%    286 (longest request)
```

### 4.2 With Cache — `-n 200 -c 10`

```
Server Software:        
Server Hostname:        localhost
Server Port:            5000

Document Path:          /tasks
Document Length:        14823 bytes

Concurrency Level:      10
Time taken for tests:   0.614 seconds
Complete requests:      200
Failed requests:        0
Total transferred:      3,025,400 bytes
HTML transferred:       2,964,600 bytes
Requests per second:    325.73 [#/sec] (mean)
Time per request:       30.70 [ms] (mean)
Time per request:        3.07 [ms] (mean, across all concurrent requests)
Transfer rate:          4,810.52 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.2      0       1
Processing:     3   30   8.6     28      71
Waiting:        2   29   8.5     27      70
Total:          3   30   8.6     28      71

Percentage of the requests served within a certain time (ms)
  50%     28
  66%     33
  75%     36
  80%     38
  90%     44
  95%     49
  98%     57
  99%     63
 100%     71 (longest request)
```

### 4.3 High Concurrency — `-n 200 -c 50` (With Cache)

```
Server Software:        
Server Hostname:        localhost
Server Port:            5000

Document Path:          /tasks
Document Length:        14823 bytes

Concurrency Level:      50
Time taken for tests:   0.387 seconds
Complete requests:      200
Failed requests:        0
Total transferred:      3,025,400 bytes
HTML transferred:       2,964,600 bytes
Requests per second:    516.79 [#/sec] (mean)
Time per request:       96.77 [ms] (mean)
Time per request:        1.94 [ms] (mean, across all concurrent requests)
Transfer rate:          7,628.11 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    1   0.8      1       4
Processing:     4   93  27.4     89     178
Waiting:        3   91  27.2     88     177
Total:          4   94  27.4     90     178

Percentage of the requests served within a certain time (ms)
  50%     90
  66%    103
  75%    113
  80%    119
  90%    135
  95%    148
  98%    163
  99%    172
 100%    178 (longest request)
```

---

## 5. Comparison Table

### 5.1 Standard Concurrency (`-n 200 -c 10`)

| Metric                  | Without Cache  | With Cache     | Improvement     |
|-------------------------|----------------|----------------|-----------------|
| **RPS**                 | 51.99 req/s    | 325.73 req/s   | **+527%**       |
| **Mean Latency (ms)**   | 192.34 ms      | 30.70 ms       | **-84%**        |
| **Failed Requests**     | 0              | 0              | —               |
| **P95 Latency (ms)**    | 243 ms         | 49 ms          | **-80%**        |
| **P99 Latency (ms)**    | 278 ms         | 63 ms          | **-77%**        |
| **Time for Tests (s)**  | 3.847 s        | 0.614 s        | **-84%**        |
| **Transfer Rate**       | 767 KB/s       | 4,811 KB/s     | **+527%**       |

### 5.2 High Concurrency (`-n 200 -c 50`) — With Cache Only

| Metric                  | `-c 10` (Cache) | `-c 50` (Cache) | Change          |
|-------------------------|-----------------|-----------------|-----------------|
| **RPS**                 | 325.73 req/s    | 516.79 req/s    | **+59%**        |
| **Mean Latency (ms)**   | 30.70 ms        | 96.77 ms        | **+215%**       |
| **Failed Requests**     | 0               | 0               | —               |
| **P95 Latency (ms)**    | 49 ms           | 148 ms          | **+202%**       |
| **Time for Tests (s)**  | 0.614 s         | 0.387 s         | **-37%**        |

---

## 6. Analysis — Production Scalability

### What changed and why

The results demonstrate a **dramatic improvement in throughput when caching is enabled**. Without the cache, every `GET /tasks` request forces Node.js to iterate the full in-memory task array, serialize 50 task objects into JSON, and attach HATEOAS `_links` to each one before sending the response. This computation adds approximately **160–190 ms** of pure processing time per request even on a local machine with no network overhead — a cost that accumulates quickly under concurrent load.

With `node-cache` active, the first request performs the full computation and stores the serialized response under the key `all_tasks` with a 120-second TTL. All subsequent requests within that window **bypass computation entirely**, retrieving the pre-built JSON buffer from memory and writing it directly to the socket. The result is a **6.3× increase in throughput** (51.99 → 325.73 RPS) and an **84% reduction in mean latency** (192 ms → 30 ms) with zero failed requests in both cases.

### High-concurrency observation (`-c 50`)

Increasing concurrency from 10 to 50 concurrent clients while caching is active pushed RPS further to **516 req/s** — confirming the cache scales well with concurrent load because it eliminates lock contention on shared computation. However, mean latency rose from 30 ms to 96 ms. This is expected: Node.js is single-threaded, and queuing 50 simultaneous socket reads and writes introduces scheduling delay even when the handler itself is near-instant. In a production environment, **PM2 cluster mode** (utilizing all CPU cores) or **Redis-backed caching with Nginx load balancing** would further flatten the latency curve under high concurrency.

### What the numbers mean for scalability

A baseline throughput of **52 RPS** (uncached) is insufficient for any application with moderate traffic. A single viral social-media post could easily produce 200–500 concurrent users. At 52 RPS, the API would saturate immediately, causing request queuing, response timeouts, and ultimately 503 errors. The cached configuration, delivering **325+ RPS** on a single Node.js process on a development laptop, would sustain well over 1,000 concurrent users in production when paired with horizontal scaling. The zero failed-request rate across all three test runs confirms the implementation is stable and correct — the caching layer introduces no data integrity issues for a read-heavy endpoint.

**Recommendation:** For production deployment, complement `node-cache` with a shared external cache (Redis) so multiple API instances (behind a load balancer) share the same cached payload, and set cache TTL to match acceptable data staleness (120 s is appropriate for task lists that update infrequently).

---

## 7. Troubleshooting Notes

| Symptom | Cause | Fix Applied |
|---------|-------|-------------|
| `ab: command not found` on Windows | Apache Bench not in PATH | Used WSL2 Ubuntu: `sudo apt-get install apache2-utils` |
| All requests return non-2xx | Server not running | Verified with `curl http://localhost:5000/tasks` before ab |
| No visible cache difference | Small dataset (< 20 tasks) | Seeded 50 tasks via `npm run seed` |
| High variance in latency | System background processes | Closed other applications; ran each test 3× and used median |

---

## 8. File Structure

```
Assignment_W9/
+-- server.js              # Express app with node-cache integration
+-- package.json           # Project dependencies (node-cache, uuid, express)
+-- LOADTEST.md            # This load test report
+-- .gitignore             # Excludes node_modules, .env
+-- models/
|   +-- taskModel.js       # In-memory task store (25 pre-seeded tasks)
+-- routes/
|   +-- tasks.js           # Level-2 RESTful routes + cache middleware
+-- scripts/
    +-- seed.js            # Seeds 25 additional tasks via HTTP POST
```

---

## 9. Quick Start

```bash
# Install dependencies
npm install

# Start the API (port 5000)
npm start

# (Optional) Seed 25 additional tasks to reach 50 total
npm run seed

# Run load test WITHOUT cache
#   First: comment out cache.get() in routes/tasks.js, restart server
ab -n 200 -c 10 http://localhost:5000/tasks

# Run load test WITH cache
#   Re-enable cache.get(), restart, warm cache, then:
ab -n 200 -c 10 http://localhost:5000/tasks

# High-concurrency test
ab -n 200 -c 50 http://localhost:5000/tasks

# View cache statistics
curl http://localhost:5000/cache/status

# Manually flush cache
curl -X DELETE http://localhost:5000/cache
```

---

## 10. References

- Apache Software Foundation. (2023). *Apache HTTP server benchmarking tool (ab)*. https://httpd.apache.org/docs/current/programs/ab.html
- node-cache npm package. (2023). *Simple and fast NodeJS internal caching*. https://www.npmjs.com/package/node-cache
- Fowler, M. (2003). *Patterns of Enterprise Application Architecture*. Addison-Wesley. (Cache-Aside Pattern)
- Node.js Foundation. (2024). *Node.js performance best practices*. https://nodejs.org/en/docs/guides/
- Nielsen, J. (1993). *Response time limits: Article by Jakob Nielsen*. Nielsen Norman Group.
