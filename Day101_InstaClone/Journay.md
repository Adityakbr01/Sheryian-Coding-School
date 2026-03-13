# Development Journey

## Day 1: User Authentication

### Implemented Features:
- User registration and login functionality with layered architecture.

### LinkedIn Post Description:
Day 101 of Cohort 2.0 at Sheryians Coding School: We started building an Instagram clone using the MERN stack. Today, I implemented user registration and login functionality. Thanks to our mentor, Ankur Bhaiya, for explaining the importance of clean code and layered architecture for production-level codebases.

#### Tools & Libraries Practiced:
- Express
- MongoDB
- JSON Web Token (JWT)
- Cookie-Parser
- CORS
- dotenv
- Nodemon
- Morgan

---

## Day 2: Post Creation

### Implemented Features:
- Post creation functionality with multer middleware for image uploads and integration with ImageKit for storage.
- Layered architecture: Routes, Controllers, Services, Repository.

### LinkedIn Post Description:
Day 102 of Cohort 2.0 at Sheryians Coding School: Implemented post creation functionality with proper layering. Thanks to our mentor, Ankur Bhaiya, for encouraging us to read documentation to become better developers.

---

## Day 3: Authenticated Post Creation

### Implemented Features:
- Post creation with authentication using JWT stored in browser cookies.
- Middleware (`isAuthenticated`) to verify JWT and attach user info to requests.
- Introduced `ApiError` for cleaner error handling.
- Added a global error handler to standardize error responses.
- Introduced `asyncHandler` to streamline error handling in async functions.

### LinkedIn Post Description:
Day 103 of Cohort 2.0 at Sheryians Coding School: Implemented post creation with authentication. Learned about the importance of image optimization (e.g., WebP) and how ImageKit handles it seamlessly. Thanks to our mentor, Ankur Bhaiya, for explaining these concepts and pushing us to write scalable code.

---

## Day 4: Full Post CRUD + Like/Unlike

### Implemented Features:
- Full CRUD (Create, Read, Update, Delete) for posts.
- Like/Unlike toggle functionality.
- Layered architecture: Routes, Controllers, Services, Repository.
- Public and protected routes divided using `router.use(isAuthenticated)`.
- Atomic MongoDB operations (`$addToSet`, `$pull`, `$inc`) for like toggling.

### LinkedIn Post Description:
Day 104 of Cohort 2.0 at Sheryians Coding School: Implemented full Post CRUD and Like/Unlike functionality. Thanks to our mentor, Ankur Bhaiya, for emphasizing clean, production-level architecture.

#### Routes Added:
| Method | Path          | Access | Description                       |
|--------|---------------|--------|-----------------------------------|
| GET    | /             | Public | Paginated feed of all posts       |
| GET    | /:postId      | Public | Single post details               |
| POST   | /             | Auth   | Create post (with optional image) |
| GET    | /my/posts     | Auth   | Logged-in user's own posts        |
| PUT    | /:postId      | Auth   | Update caption/image (owner only) |
| DELETE | /:postId      | Auth   | Delete post (owner only)          |
| POST   | /:postId/like | Auth   | Toggle like/unlike                |

---

## Day 5: Followers System Design

### Implemented Features:
- Designed a scalable followers system using a separate `Follow` collection.
- Removed `followers` and `followings` arrays from the `User` model to avoid hitting MongoDB's 16MB document size limit.
- Created an edge collection `Follow` with the following schema:
  ```json
  {
    "_id": ObjectId,
    "follower": ObjectId,
    "following": ObjectId,
    "createdAt": Date
  }
  ```

### LinkedIn Post Description:
Day 105 of Cohort 2.0 at Sheryians Coding School: Designed a scalable followers system. Learned why storing followers in a separate collection is better than embedding them in the user document. Thanks to our mentor, Ankur Bhaiya, for explaining these concepts.

---

## Day 6: Follow/Unfollow + Like/Unlike Refactor + Follow Request Status

### Implemented Features:
- Follow/Unfollow functionality.
- Implemented **Follow Request Status** ("pending", "active", "rejected", "blocked"). Follow requests default to "pending" upon creation.
- Added endpoints to accept/reject/block follow requests, and to fetch all pending requests.
- Refactored `Follow` model to use `String` fields for `follower` and `following` (future-proofing for user IDs) and added the `status` enum.
- Created a `Like` collection for scalability, removing `likes` and `comments` arrays from the `Post` model.
- `Like` schema:
  ```json
  {
    "post": ObjectId,
    "likedBy": ObjectId,
    "createdAt": Date
  }
  ```

### LinkedIn Post Description:
Day 106 of Cohort 2.0 at Sheryians Coding School: Implemented Follow/Unfollow and Like/Unlike functionality with scalable design. Also added a robust status management system for followers ("pending", "active", "rejected", "blocked") to handle user privacy effectively. Thanks to our mentor, Ankur Bhaiya, for guiding us through these changes and emphasizing scalability.

---

## Day 7: Frontend Integration — Auth UI & Scalable API Layer

### Implemented Features:
- Set up **React client** with Vite, React Router v7, and SCSS (sass-embedded).
- Built a **feature-based folder structure** under `src/features/auth/` with dedicated `pages/`, `components/`, `styles/`, `services/`, and `hooks/` directories.
- Created a **pixel-perfect Instagram dark-mode** Login and Register UI — floating-label inputs, password show/hide toggle, OR divider, Facebook button, app store badges, and footer links.
- Built a **reusable `AuthInput` component** with controlled state and floating-label CSS.
- Created a **scalable Axios instance** (`src/utils/api.js`) with:
  - `baseURL: /api/v1` and `withCredentials: true` for cookie-based auth.
  - Request interceptor (ready for Bearer token attachment).
  - Response interceptor that unwraps the axios envelope and auto-redirects to `/login` on 401.
- Created a **feature-scoped auth API service** (`authApi.js`) with `login()` and `register()` methods.
- Built a **`useAuth` custom hook** that manages `loading`, `error`, and `submit()` state for any auth endpoint.
- Wired **LoginPage** to `POST /api/v1/auth/login` — auto-detects email vs username from user input.
- Wired **RegisterPage** to `POST /api/v1/auth/register` — sends `{ email, userName, password }`.
- Added **Vite dev server proxy** (`/api` → `http://localhost:3000`) for seamless backend communication during development.
- Forms show **loading state**, **disabled submit** when fields are empty, and **inline error messages** from the API.

### LinkedIn Post Description:
Day 107 of Cohort 2.0 at Sheryians Coding School: Integrated the React frontend with our Express backend. Built pixel-perfect Instagram dark-mode Login and Register pages using a feature-based architecture. Set up a scalable Axios instance with request/response interceptors, a dedicated auth API service layer, and a custom `useAuth` hook — keeping the API layer clean and ready to scale as we add more features. Thanks to our mentor, Ankur Bhaiya, for pushing us to write production-quality code from day one.

#### Tools & Libraries Practiced:
- React 19 + Vite
- React Router v7 (`createBrowserRouter`, `RouterProvider`)
- Axios (instance, interceptors, `withCredentials`)
- SCSS (sass-embedded)
- Vite dev proxy

#### Client Architecture:
```
src/
├── utils/
│   └── api.js                  # Axios instance + interceptors
├── features/
│   └── auth/
│       ├── components/
│       │   └── AuthInput.jsx   # Reusable floating-label input
│       ├── pages/
│       │   ├── LoginPage.jsx   # Instagram login clone
│       │   └── RegisterPage.jsx# Instagram register clone
│       ├── services/
│       │   └── authApi.js      # Auth API endpoints
│       ├── hooks/
│       │   └── useAuth.js      # Auth form state hook
│       └── styles/
│           └── form.scss       # Dark-mode Instagram auth styles
└── routes/
    └── index.jsx               # Client-side routing
```

---





---

## Day 8: Auth Context & API Integration

### Implemented Features:
- Created a **scalable Axios instance** (`src/utils/api.js`) with request/response interceptors for cookie-based auth and centralized error handling.
- Built a **feature-scoped auth API service** (`authApi.js`) with `login()` and `register()` methods — keeps API calls organized and reusable.
- Created an **AuthContext** (`src/provider/AuthContext.jsx`) using React Context API to manage global auth state:
  - `user` — the currently logged-in user object (or `null`).
  - `loading` — boolean flag for in-flight auth requests.
  - `error` — API error message for inline UI feedback.
  - `handleRegister(formData)` — calls the register endpoint and stores the returned user in state.
  - `handleLogin(formData)` — calls the login endpoint and stores the returned user in state.
  - `logout()` — clears user state.
- Wrapped the entire app in `<AuthProvider>` so any component can access auth state via `useAuthContext()`.
- Refactored **LoginPage** and **RegisterPage** to consume `AuthContext` instead of the standalone `useAuth` hook — auth state is now shared across the app.
- On successful login/register, the user object is stored in context and the user is navigated to `/`.

### LinkedIn Post Description:
Day 108 of Cohort 2.0 at Sheryians Coding School: Built a global AuthContext using React Context API to manage user authentication state across the app. Created a dedicated auth API service layer with Axios, integrated login and register endpoints, and refactored both auth pages to share state through context. Now any component in the app can access the logged-in user — setting the stage for protected routes and user-specific features.

Thanks to our mentor, Ankur Bhaiya, for emphasizing the importance of centralized state management and building scalable frontend architectures from day one.

#### Tools & Libraries Practiced:
- React Context API (`createContext`, `useContext`)
- Axios (instance, interceptors, `withCredentials`)
- React Router v7 (`useNavigate`)
- `useCallback` for stable context handlers

#### Client Architecture (Updated):
```
src/
├── utils/
│   └── api.js                  # Axios instance + interceptors
├── provider/
│   └── AuthContext.jsx         # Global auth state (user, loading, error, handlers)
├── features/
│   └── auth/
│       ├── components/
│       │   └── AuthInput.jsx   # Reusable floating-label input
│       ├── pages/
│       │   ├── LoginPage.jsx   # Consumes AuthContext for login
│       │   └── RegisterPage.jsx# Consumes AuthContext for register
│       ├── services/
│       │   └── authApi.js      # Auth API endpoints (login, register)
│       ├── hooks/
│       │   └── useAuth.js      # Lightweight form-level auth hook (still available)
│       └── styles/
│           └── form.scss       # Dark-mode Instagram auth styles
└── routes/
    └── index.jsx               # Client-side routing
```



## Day 9: Revision — 4-Layer React Frontend Architecture

### What Was Revised:
Revisited and solidified the **4-layer architecture** established on Day 8 for the React frontend. The goal was to fully understand the data flow and separation of concerns across every layer:

#### Layer 1 — Axios Instance (`utils/api.js`)
The foundation. A configured Axios instance with:
- `baseURL` and `withCredentials: true` for cookie-based auth.
- **Request interceptor** — ready to attach Bearer tokens if needed later.
- **Response interceptor** — unwraps the Axios envelope (`response.data`), handles 401 redirects, and normalizes error messages.
- Every API call in the app goes through this single instance — one place to manage headers, timeouts, and error handling.

#### Layer 2 — API Service (`features/auth/services/authApi.js`)
Feature-scoped API methods that consume the Axios instance:
- `authApi.login(data)` → `POST /api/v1/auth/login`
- `authApi.register(data)` → `POST /api/v1/auth/register`
- Keeps endpoint URLs and request shapes in one place — pages never call Axios directly.

#### Layer 3 — Context / State Management (`provider/AuthContext.jsx`)
Global state layer using React Context API:
- Stores `user`, `loading`, and `error` state.
- Exposes `handleLogin()`, `handleRegister()`, and `logout()` — these call the API service (Layer 2) and update state.
- Wrapped around the entire app via `<AuthProvider>` in `main.jsx`.
- Any component can access auth state using the `useAuthContext()` hook.

#### Layer 4 — Pages / UI (`features/auth/pages/`)
The presentation layer:
- `LoginPage` and `RegisterPage` consume `useAuthContext()` for state and handlers.
- Pages manage only **local form state** (`useState`) and delegate all API + global state logic to the context.
- Navigate to `/` on success; display `error` from context inline.

#### Data Flow (Login Example):
```
User clicks "Log in"
  → LoginPage.handleSubmit()
    → AuthContext.handleLogin(formData)       [Layer 3]
      → authApi.login(formData)              [Layer 2]
        → api.post('/auth/login', formData)  [Layer 1]
          → Backend responds
        ← Response interceptor unwraps data
      ← authApi returns response
    ← Context sets user state
  ← Page navigates to '/'
```

### LinkedIn Post Description:
Day 109 of Cohort 2.0 at Sheryians Coding School: Revised and deepened my understanding of the 4-layer React frontend architecture we built for our Instagram clone. Breaking the frontend into Axios Instance → API Service → Context (State Management) → Pages (UI) keeps concerns cleanly separated — the Axios instance handles HTTP config and interceptors, the API service owns endpoint definitions, the Context manages global auth state, and pages focus purely on UI and local form state. This layered approach mirrors the backend's Routes → Controllers → Services → Repository pattern, making the entire MERN stack consistent and scalable.

Thanks to our mentor, Ankur Bhaiya, for emphasizing that understanding *why* the architecture works is just as important as building it.

#### Key Takeaways:
- **Single Responsibility**: Each layer does one thing well — no layer reaches into another's domain.
- **Consistency**: Frontend layers (Axios → Service → Context → Page) mirror backend layers (Routes → Controllers → Services → Repository).
- **Scalability**: Adding a new feature (e.g., posts) means creating a new service, a new context (or extending the existing one), and new pages — the Axios instance and interceptors stay untouched.
- **Debuggability**: When something breaks, you know exactly which layer to check based on the type of error (network → Layer 1, endpoint → Layer 2, state → Layer 3, UI → Layer 4).

#### Architecture Comparison:
```
Backend (Express)              Frontend (React)
─────────────────              ─────────────────
Routes                    ↔    Pages (UI Components)
Controllers               ↔    Context (State Management)
Services                  ↔    API Services (authApi.js)
Repository (DB Access)    ↔    Axios Instance (HTTP Layer)
```
