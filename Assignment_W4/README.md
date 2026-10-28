# Assignment W4 - Richardson Maturity Model Evaluation

**Course:** Advanced Web Development Frameworks (ITUE301)  
**Week:** 4 | CO2 / PO3  
**Author:** Aayush Kathiriya  

## About

This assignment evaluates the Task Management REST API against the **Richardson Maturity Model (RMM)** Levels 0-3.

**RMM Level Achieved: Level 2** (HTTP Verbs + Status Codes)

## Key Deliverables

| File | Description |
|------|-------------|
| `MATURITY.md` | Full RMM evaluation table, per-endpoint analysis, HATEOAS awareness section |
| `routes/tasks.js` | Corrected Level-2 compliant route handlers |
| `models/taskModel.js` | In-memory task store |
| `server.js` | Express server entry point |

## Quick Start

```bash
npm install
npm start        # http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Description | Status Code |
|--------|----------|-------------|-------------|
| GET | `/tasks` | Get all tasks | 200 |
| POST | `/tasks` | Create task | 201 |
| GET | `/tasks/:id` | Get single task | 200 / 404 |
| PUT | `/tasks/:id` | Full replace | 200 / 404 |
| PATCH | `/tasks/:id` | Partial update | 200 / 404 |
| DELETE | `/tasks/:id` | Delete task | 204 / 404 |
