# Security Documentation — Task Management API

**Course:** Advanced Web Development Frameworks (ITUE301)
**Week:** 7 | **CO:** CO2, CO6 / **PO:** PO3, PO10
**Author:** Aayush Kathiriya
**Topics:** STRIDE Threat Model, HTTPS/TLS, express-mongo-sanitize

---

## 1. STRIDE Threat Model

The **STRIDE** model (developed by Microsoft) categorizes security threats across six dimensions. Each category below is evaluated against the Task Management API.

| Threat | Example in Your App | Mitigation Applied or Planned |
|--------|--------------------|---------------------------------|
| **Spoofing** (Impersonating another user or system) | An attacker sends requests pretending to be an authenticated user by forging or stealing session tokens. Example: `POST /tasks` with a stolen Bearer token to create tasks on behalf of another user. | **Applied:** Use JWT (JSON Web Tokens) for stateless authentication — each token is signed with a server secret and expires. **Planned:** Add refresh token rotation and token blacklisting on logout. |
| **Tampering** (Modifying data in transit or at rest) | A man-in-the-middle (MITM) attack intercepts `PATCH /tasks/:id` over plain HTTP and modifies the task title or status before it reaches the server. | **Applied:** HTTPS/TLS (mkcert, port 5443) encrypts all data in transit — intercepted packets cannot be read or modified. `Strict-Transport-Security` header enforces HTTPS on all future requests. |
| **Repudiation** (Denying an action was performed) | A user deletes a task via `DELETE /tasks/:id` and later claims they never performed the action. Without logs, there is no audit trail to prove otherwise. | **Planned:** Implement structured request logging (e.g., Morgan + Winston) capturing timestamp, user ID, IP address, HTTP method, and endpoint for every mutating request. Store logs in a tamper-evident system. |
| **Information Disclosure** (Exposing sensitive data) | Unhandled exceptions expose full stack traces in API error responses (e.g., `Error: Cannot read property 'id' of undefined at routes/tasks.js:45`). Also: storing passwords in plaintext in task descriptions. | **Applied:** Global error handler returns generic `500 Internal Server Error` — no stack trace in production. `X-Content-Type-Options: nosniff` prevents MIME-type sniffing. **Planned:** Add `helmet.js` for comprehensive header security and rate limiting to slow information enumeration. |
| **Denial of Service** (Making the service unavailable) | An attacker floods `GET /tasks` with thousands of requests per second, exhausting server resources and making the API unavailable to legitimate users. | **Planned:** Implement `express-rate-limit` middleware to cap requests per IP (e.g., 100 requests per 15 minutes). Add request payload size limits (`express.json({ limit: '10kb' })`). Deploy behind a load balancer or API gateway (e.g., AWS ALB) with DDoS protection. |
| **Elevation of Privilege** (Gaining unauthorized permissions) | An unauthenticated user calls `DELETE /tasks/:id` or `PUT /tasks/:id` — endpoints that should be restricted to authenticated admins or task owners. | **Planned:** Implement Role-Based Access Control (RBAC) middleware: verify JWT on every protected route, check `req.user.role === 'admin'` before allowing destructive operations. Deny with `403 Forbidden` for unauthorized roles. |

---

## 2. HTTPS/TLS Configuration

### 2.1 Why HTTPS?

HTTP transmits data in **plaintext** — any network intermediary (router, ISP, attacker) can read and modify requests and responses. HTTPS wraps HTTP inside **TLS (Transport Layer Security)**, providing:

- **Encryption** — data is unreadable in transit
- **Integrity** — data cannot be modified without detection
- **Authentication** — the server's identity is verified by a certificate authority

### 2.2 mkcert Setup (Local Development)

`mkcert` creates locally-trusted TLS certificates signed by a local Certificate Authority (CA) it installs into your system trust store. This eliminates browser certificate warnings during development.

```bash
# Step 1: Install the local CA (run once per machine)
mkcert -install

# Step 2: Generate certificate for localhost
mkcert localhost

# Output files:
#   localhost.pem      -> certificate (public)
#   localhost-key.pem  -> private key (keep secret, never commit)
```

### 2.3 HTTPS Server Configuration (Express)

```javascript
const https = require('https');
const fs    = require('fs');

const sslOptions = {
  key:  fs.readFileSync('localhost-key.pem'),
  cert: fs.readFileSync('localhost.pem'),
};

https.createServer(sslOptions, app).listen(5443, () => {
  console.log('HTTPS server running on https://localhost:5443');
});
```

The API runs on:
- **HTTP:**  `http://localhost:3000`  (fallback / development)
- **HTTPS:** `https://localhost:5443` (primary, TLS encrypted)

### 2.4 Certificate Files — Git Exclusion

Private key files are excluded from version control via `.gitignore`:

```
# .gitignore
localhost.pem
localhost-key.pem
*.pem
*.key
```

> **IMPORTANT:** Never commit `.pem` or `.key` files to a public repository. This exposes the private key and completely undermines TLS security.

---

## 3. NoSQL Injection Prevention — express-mongo-sanitize

### 3.1 What is NoSQL Injection?

NoSQL injection exploits MongoDB query operators (e.g., `$gt`, `$ne`, `$where`) embedded in user-supplied input to bypass authentication or extract unauthorized data.

**Example malicious payload:**
```json
{
  "email":    { "$gt": "" },
  "password": { "$gt": "" }
}
```
Without sanitization, MongoDB interprets `$gt: ""` as "match any value greater than empty string" — effectively matching **all documents**, bypassing authentication entirely.

### 3.2 Installation

```bash
npm install express-mongo-sanitize
```

### 3.3 Application (Before All Routes)

```javascript
const mongoSanitize = require('express-mongo-sanitize');

// CRITICAL: Apply BEFORE route definitions
app.use(
  mongoSanitize({
    replaceWith: '_',   // replaces '$' and '.' in keys with '_'
    onSanitize: ({ req, key }) => {
      console.warn(`[SECURITY] Sanitized key '${key}' in ${req.method} ${req.originalUrl}`);
    },
  })
);
```

### 3.4 Before / After Comparison

**Without `express-mongo-sanitize`:**

Request body received by route handler:
```json
{
  "title": "Legit Task",
  "$where": "function() { return true; }",
  "nested": { "$gt": "" }
}
```
MongoDB would process `$where` and `$gt` as operators — **dangerous**.

**With `express-mongo-sanitize`:**

Request body received by route handler (keys sanitized):
```json
{
  "title": "Legit Task",
  "_where": "function() { return true; }",
  "nested": { "_gt": "" }
}
```
The `$` prefix is replaced with `_` — **MongoDB operators are neutralized**. The server also logs a warning:
```
[SECURITY] Sanitized key '$where' in POST /tasks
[SECURITY] Sanitized key '$gt' in POST /tasks
```

### 3.5 Test — Sending Malicious Payload

```bash
curl -X POST https://localhost:5443/tasks \
  -H "Content-Type: application/json" \
  -d '{ "email": { "$gt": "" }, "password": { "$gt": "" } }'
```

**Expected response (validation rejects the sanitized payload):**
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": ["title is required."]
}
```
The injection attempt is neutralized — `$gt` keys are sanitized to `_gt` before the route handler processes the body.

---

## 4. HTTPS vs HTTP — TLS vs JWT Comparison

### 4.1 What Does TLS Protect?

| Aspect | HTTP | HTTPS (TLS) |
|--------|------|-------------|
| Data in transit | Plaintext — readable by anyone | Encrypted — unreadable to intermediaries |
| Man-in-the-middle attacks | Vulnerable | Protected (certificate validation) |
| Request/response integrity | Not guaranteed | Guaranteed (MAC-verified) |
| Server identity verification | None | Certificate Authority verifies server |
| Protection scope | None | **Network layer** — protects all data between client and server |

TLS operates at the **transport layer** — it encrypts the entire HTTP conversation, including headers, URLs, and body, between the client and server. It does **not** know or care about the content of the data (users, roles, sessions).

### 4.2 What Does JWT Protect?

| Aspect | Without JWT | With JWT |
|--------|------------|---------|
| User identity | Anyone can call any endpoint | Only authenticated users with valid tokens |
| Authorization | No role enforcement | Claims in token define what user can do |
| Session state | Server must store sessions | Stateless — server verifies signature only |
| Token forgery | N/A | HMAC/RSA signature prevents tampering |
| Protection scope | None | **Application layer** — protects resources and actions |

JWT (JSON Web Token) operates at the **application layer** — it verifies **who** is making a request and **what** they are authorized to do. It does not protect the data in transit.

### 4.3 Why You Need Both

```
Client  ──[TLS/HTTPS]──►  Server
         (encrypted pipe)    │
                             ├── [JWT] Who is this user?
                             ├── [JWT] Are they allowed to DELETE?
                             └── [mongoSanitize] Is the input safe?
```

| Layer | Technology | Protects Against |
|-------|-----------|-----------------|
| Transport | TLS (HTTPS) | Eavesdropping, MITM, packet tampering |
| Authentication | JWT | Unauthorized access, identity spoofing |
| Input | express-mongo-sanitize | NoSQL injection, operator injection |

**Summary:** TLS protects the **channel** (nobody can read the pipe). JWT protects the **identity** (only authorized users can act). Both are required — TLS alone does not stop an attacker with a valid stolen token, and JWT alone does not stop MITM on an HTTP connection.

---

## 5. File Structure

```
Assignment_W7/
+-- server.js              # Express entry point (HTTPS + mongoSanitize)
+-- package.json           # Dependencies
+-- SECURITY.md            # This security documentation
+-- .gitignore             # Excludes certs, node_modules
+-- models/
|   +-- taskModel.js       # In-memory task store
+-- routes/
    +-- tasks.js           # RESTful route handlers

# NOT committed (gitignored):
# localhost.pem            # TLS certificate (public)
# localhost-key.pem        # TLS private key (SECRET)
```

---

## 6. How to Run

```bash
# 1. Install dependencies
npm install

# 2. Generate TLS certificates (one-time)
mkcert -install
mkcert localhost

# 3. Start the server
npm start

# HTTP  → http://localhost:3000
# HTTPS → https://localhost:5443
```

---

## 7. References

- OWASP. (2021). *OWASP Top Ten*. https://owasp.org/www-project-top-ten/
- Microsoft Security. *STRIDE Threat Model*. https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats
- express-mongo-sanitize. https://www.npmjs.com/package/express-mongo-sanitize
- mkcert. https://github.com/FiloSottile/mkcert
- MDN Web Docs. *TLS*. https://developer.mozilla.org/en-US/docs/Web/Security/Transport_Layer_Security
