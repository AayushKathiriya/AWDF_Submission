/**
 * scripts/seed.js — Task Data Seed Script
 * Week 9: Performance Load Testing
 * Author: Aayush Kathiriya
 *
 * PURPOSE:
 *   Generates and POSTs 50 task documents to the running API so the
 *   GET /tasks endpoint returns a meaningful payload during load tests.
 *
 * USAGE:
 *   1. Start the API:  npm start
 *   2. Run this script: node scripts/seed.js
 *
 * NOTE:
 *   The in-memory model already seeds 25 tasks on startup.
 *   This script adds 25 more via HTTP POST so you can reach 50+ documents
 *   as recommended in the assignment troubleshooting guide.
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

const statuses   = ['pending', 'in-progress', 'completed'];
const priorities = ['low', 'medium', 'high'];

const sampleTasks = [
  { title: 'Analyse API Response Times',         description: 'Profile endpoint latency with and without caching.',         status: 'pending',     priority: 'high'   },
  { title: 'Configure Compression Middleware',    description: 'Enable gzip/brotli via the compression npm package.',        status: 'pending',     priority: 'medium' },
  { title: 'Benchmark Database Read Operations',  description: 'Measure MongoDB find() performance on 10k documents.',      status: 'in-progress', priority: 'high'   },
  { title: 'Implement Connection Pooling',        description: 'Tune Mongoose connection pool size for throughput.',         status: 'pending',     priority: 'medium' },
  { title: 'Review Memory Usage Under Load',      description: 'Monitor heap size during ab -n 500 -c 50 test runs.',       status: 'pending',     priority: 'high'   },
  { title: 'Add ETag Support',                    description: 'Return ETags to enable conditional GET requests.',           status: 'pending',     priority: 'low'    },
  { title: 'Tune Node.js Event Loop',             description: 'Profile libuv event loop lag during concurrent requests.',  status: 'pending',     priority: 'medium' },
  { title: 'Implement HTTP/2',                    description: 'Enable HTTP/2 multiplexing to reduce connection overhead.', status: 'pending',     priority: 'low'    },
  { title: 'Set Up Load Balancer',                description: 'Configure Nginx as reverse proxy with upstream pool.',      status: 'pending',     priority: 'high'   },
  { title: 'Profile Cache Eviction Policy',       description: 'Evaluate LRU vs TTL eviction for node-cache.',             status: 'pending',     priority: 'medium' },
  { title: 'Document Benchmark Methodology',      description: 'Write a reproducible benchmark procedure in LOADTEST.md.',  status: 'in-progress', priority: 'high'   },
  { title: 'Run Stress Test at -c 100',           description: 'Observe failure rates and error responses under stress.',   status: 'pending',     priority: 'high'   },
  { title: 'Measure P95 Latency',                 description: 'Extract 95th percentile latency from ab output.',           status: 'pending',     priority: 'medium' },
  { title: 'Compute Throughput Ceiling',          description: 'Determine max sustainable RPS before error rate rises.',    status: 'pending',     priority: 'high'   },
  { title: 'Evaluate Cold vs Warm Cache',         description: 'Compare first-request latency with subsequent cached hits.', status: 'pending',    priority: 'medium' },
  { title: 'Update README with Test Results',     description: 'Add load test summary to the assignment README.',           status: 'pending',     priority: 'low'    },
  { title: 'Verify Zero Failed Requests',         description: 'Ensure error rate = 0 for baseline -n 200 -c 10 test.',    status: 'pending',     priority: 'high'   },
  { title: 'Profile JSON Serialisation Cost',     description: 'Measure overhead of JSON.stringify for large payloads.',    status: 'pending',     priority: 'low'    },
  { title: 'Check Keep-Alive Behaviour',          description: 'Confirm HTTP keep-alive is enabled to reduce TCP overhead.', status: 'pending',    priority: 'medium' },
  { title: 'Archive Load Test Raw Output',        description: 'Save raw ab stdout to /scripts/results/ for reference.',   status: 'pending',     priority: 'low'    },
  { title: 'Compare node-cache vs Redis',         description: 'Document trade-offs between in-process and external cache.', status: 'pending',    priority: 'medium' },
  { title: 'Validate Cache-Control Headers',      description: 'Inspect X-Cache and Cache-Control headers in responses.',  status: 'pending',     priority: 'low'    },
  { title: 'Clean Up Old Test Data',              description: 'Remove seeded tasks after load testing is complete.',       status: 'pending',     priority: 'low'    },
  { title: 'Submit Assignment W9',                description: 'Push LOADTEST.md, seed script, and server files to GitHub.', status: 'pending',   priority: 'high'   },
  { title: 'Prepare Week 10 Environment',         description: 'Set up starter code and tooling for the next assignment.', status: 'pending',     priority: 'low'    },
];

function postTask(task) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(task);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/tasks',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 201) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Unexpected status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function seed() {
  console.log('[SEED]  Connecting to http://localhost:5000 ...\n');
  let success = 0;
  let failed  = 0;

  for (const task of sampleTasks) {
    try {
      const result = await postTask(task);
      console.log(`[OK]    Created: "${task.title}" (id: ${result.data.id})`);
      success++;
    } catch (err) {
      console.error(`[FAIL]  "${task.title}" — ${err.message}`);
      failed++;
    }
  }

  console.log(`\n[SEED]  Done. Created: ${success} | Failed: ${failed}`);
  console.log('[SEED]  Total tasks in store: 25 (pre-seeded) + ' + success + ' = ' + (25 + success));
  console.log('[SEED]  You can now run: ab -n 200 -c 10 http://localhost:5000/tasks\n');
}

seed();
