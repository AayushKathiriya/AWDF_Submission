# CIE Practical Exam — Full-Stack Task Management System

**Course:** Advanced Web Development Frameworks (ITUE301)  
**Author:** Aayush Kathiriya  
**Project:** TaskFlow CIE Practical Submission  
**Repository:** `AWDF_Submission / CIE_Practical`  

---

## 🎯 Rubric Compliance Matrix (Tasks T1 – T5)

| Task | Rubric Criteria | Implementation Evidence |
|:---:|---|---|
| **T1: Component Architecture** | • Reusable card component renders all specified props<br>• 3 distinct page components exist<br>• No everything-in-App anti-pattern<br>• Conditional rendering (badge color & button swap) | • [`TaskCard.jsx`](frontend/src/components/TaskCard.jsx) renders `title`, `description`, `priority`, `status`, `assignedTo`, `project`, `onStatusToggle`, `onDelete`<br>• 3 Pages: [`DashboardPage.jsx`](frontend/src/pages/DashboardPage.jsx), [`CreateTaskPage.jsx`](frontend/src/pages/CreateTaskPage.jsx), [`LoginPage.jsx`](frontend/src/pages/LoginPage.jsx)<br>• [`App.jsx`](frontend/src/App.jsx) is strictly a Router/Provider shell<br>• **Badge swap:** Urgent/High (Red), Medium (Amber), Low (Green)<br>• **Button swap:** Completed -> "Reopen ↺" vs Pending -> "Mark Done ✓" |
| **T2: Routing & State Management** | • React Router configured correctly<br>• Protected route redirects unauthenticated users<br>• Auth state lifted to context/store<br>• Controlled form reflects state live | • React Router v6 in `App.jsx` with `/`, `/tasks/new`, `/login`<br>• [`ProtectedRoute.jsx`](frontend/src/components/ProtectedRoute.jsx) guards `/tasks/new` and redirects to `/login`<br>• [`AuthContext.jsx`](frontend/src/context/AuthContext.jsx) lifts token, user, login, logout<br>• [`CreateTaskPage.jsx`](frontend/src/pages/CreateTaskPage.jsx) has two-way bound inputs and real-time live preview |
| **T3: RESTful API + Middleware** | • 5 working endpoints at `/api/v1/`<br>• Correct HTTP verbs and status codes<br>• Custom `requestLogger` + `authGuard` wired<br>• Global error-handling returns structured JSON | • 5+ endpoints under `/api/v1/` (`POST /auth/login`, `GET /tasks`, `POST /tasks`, `PATCH /tasks/:id/status`, `DELETE /tasks/:id`)<br>• [`requestLogger.js`](backend/middleware/requestLogger.js) logs method, URL, duration (ms)<br>• [`authGuard.js`](backend/middleware/authGuard.js) verifies Bearer JWT tokens<br>• [`errorHandler.js`](backend/middleware/errorHandler.js) structured JSON error responses |
| **T4: API Integration + Lifecycle** | • `useEffect` fetches on mount<br>• Loading state shown<br>• Error state displayed on failure<br>• Data renders via reusable card<br>• Client-side filter/search without new API call | • `useEffect` triggers `fetchTasks()` on mount in `DashboardPage.jsx`<br>• Custom spinner loading state<br>• Clean alert banner on failure with retry button<br>• Rendered with `TaskCard`<br>• Live client-side search by text and filter by status/priority without re-fetching |
| **T5: MongoDB + Schema Validation** | • 3 Mongoose schemas with required, enum, min, unique<br>• POST validates and saves (201 Created)<br>• GET uses `.populate()`<br>• Validation failure returns clean 400 (not raw Mongoose) | • 3 Models: [`User.js`](backend/models/User.js), [`Project.js`](backend/models/Project.js), [`Task.js`](backend/models/Task.js)<br>• `POST /api/v1/tasks` returns 201 Created upon successful save<br>• `GET /api/v1/tasks` populates `assignedTo` (User) and `project` (Project)<br>• Clean 400 formatting catches `ValidationError` and returns readable messages |

---

## 📂 Project Structure

```text
CIE_Practical/
├── README.md                          # Full documentation & rubric mapping
├── .gitignore                         # Ignores node_modules, .env, build files
├── backend/
│   ├── package.json                   # Express, Mongoose, JWT, bcryptjs, cors
│   ├── server.js                      # Express server with /api/v1/ wiring
│   ├── .env                           # Environment configuration
│   ├── .env.example
│   ├── config/
│   │   └── db.js                      # MongoDB connection with fallback
│   ├── middleware/
│   │   ├── requestLogger.js           # Custom logger (T3)
│   │   ├── authGuard.js               # Bearer JWT validator (T3)
│   │   └── errorHandler.js            # Structured error formatter (T3, T5)
│   ├── models/
│   │   ├── User.js                    # Schema 1: required, min, unique, enum
│   │   ├── Project.js                 # Schema 2: required, min, unique, category enum
│   │   └── Task.js                    # Schema 3: required, enum, min, references
│   ├── routes/
│   │   ├── authRoutes.js              # /api/v1/auth/login, /api/v1/auth/register
│   │   └── taskRoutes.js              # /api/v1/tasks CRUD with .populate()
│   └── seed/
│       └── seedData.js                # Database seeder script
└── frontend/
    ├── package.json                   # React 18, React Router v6, Vite
    ├── vite.config.js                 # Vite proxy to backend port 5000
    ├── index.html                     # Outfit & Inter fonts
    └── src/
        ├── main.jsx                   # Entry point
        ├── App.jsx                    # Router & Context shell (No anti-pattern)
        ├── index.css                  # Modern dark glassmorphic design system
        ├── context/
        │   └── AuthContext.jsx        # Lifted auth state (token, user, login, logout)
        ├── components/
        │   ├── Navbar.jsx             # Navigation and user state bar
        │   ├── ProtectedRoute.jsx     # Redirects unauthenticated users to /login
        │   ├── TaskCard.jsx           # Reusable card with conditional badge/button swap
        │   └── Alert.jsx              # Reusable error & success notifications
        └── pages/
            ├── DashboardPage.jsx      # Page 1: useEffect, loading, error, client search
            ├── CreateTaskPage.jsx     # Page 2: Controlled form with live preview
            ├── LoginPage.jsx          # Page 3: Controlled sign-in with quick demo
            └── NotFoundPage.jsx       # 404 client-side route
```

---

## 🚀 Running the Project

### 1. Start the Backend API
```bash
cd CIE_Practical/backend
npm install
# (Optional: run database seed)
npm run seed
npm start
```
*Backend runs on `http://localhost:5000` (API Base: `http://localhost:5000/api/v1/`)*

### 2. Start the Frontend
```bash
cd CIE_Practical/frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

### 3. Demo Credentials
- **Email:** `demo@cie.edu`
- **Password:** `admin123`
*(A 1-click **"Auto-Fill Demo Credentials"** button is also available on the Login page).*
