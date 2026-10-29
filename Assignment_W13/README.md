# Assignment W13 — AI-Assisted UI Customization and Design

**Course:** Advanced Web Development Frameworks (ITUE301)  
**Week:** 13 | **CO:** CO6 / **PO:** PO3, PO12  
**Author:** Aayush Kathiriya  

---

## 📌 Overview

This lab explores **AI-assisted customized designing**, **prompt engineering for UI**, and **responsible AI review**. A backend endpoint integrates with OpenAI GPT-4o-mini (with automated graceful fallback) to generate cohesive color schemes, font pairings, and layout recommendations. The React frontend consumes these suggestions dynamically via CSS custom variables, providing before/after comparisons and a WCAG accessibility audit.

---

## 📂 Project Structure

```text
Assignment_W13/
├── AI_EVALUATION.md             # ⭐ Main deliverable — evaluation, prompts, WCAG audit, reflection
├── README.md                    # Project overview & running instructions
├── .gitignore                   # Ignores node_modules, logs, .env
├── backend/
│   ├── .env.example             # Example environment config (OPENAI_API_KEY)
│   ├── package.json             # Express, OpenAI SDK, NodeCache, UUID
│   ├── server.js                # Express API with /api/ai/design-suggestion
│   ├── routes/
│   │   ├── ai.js                # AI prompt engineering & graceful fallback route
│   │   └── tasks.js             # Task CRUD routes with caching
│   └── models/
│       └── taskModel.js         # Mongoose schema / data model
├── frontend/
│   ├── index.html               # Entry HTML with Outfit & Inter font imports
│   ├── package.json             # Vite React frontend configuration
│   ├── vite.config.js           # Vite config with backend proxy
│   └── src/
│       ├── main.jsx             # React DOM root render
│       ├── App.jsx              # Main dashboard with Before/After theme toggle
│       ├── index.css            # Dynamic CSS custom variables & dark glassmorphism
│       └── components/
│           ├── AiSuggestionPanel.jsx  # AI controls, palette swatches, WCAG check
│           ├── TaskCard.jsx           # Responsive card with priority & status chips
│           └── TaskForm.jsx           # Task creation form with validation
└── docs/
    ├── before.png / before.jpg  # Baseline UI screenshot (Before AI)
    └── after.png / after.jpg    # Modernized UI screenshot (After AI)
```

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
# (Optional) set OPENAI_API_KEY in .env, or run with automatic fallback
npm start
```
*Backend runs on `http://localhost:5000`*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🧪 Testing the AI Endpoint

```bash
curl -X POST http://localhost:5000/api/ai/design-suggestion \
  -H "Content-Type: application/json" \
  -d '{"appDescription": "Modern dark-mode task board with priority badges"}'
```
