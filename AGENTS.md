# Idea Swipe - Technical Roadmap

This document outlines the core modules and a feature development plan for transitioning to a full-stack architecture.

## Core Modules

### 1. Frontend (Next.js App Router)
*   **Responsibility**: UI/UX, client-side state management, and API communication.
*   **Tasks**:
    *   Refactor existing React components into the `app/` directory structure.
    *   Replace `localStorage` with API calls to the Next.js backend.
    *   Implement UI for authentication (login/signup forms).
    *   Manage user session state (e.g., using React Context or a session provider).

### 2. Backend (Next.js API Routes)
*   **Responsibility**: Business logic, data validation, and handling requests from the frontend.
*   **Tasks**:
    *   Create API routes under `app/api/`.
    *   Implement endpoints for CRUD operations on Users, Folders, and Ideas using Prisma Client.
    *   Create a protected endpoint for interacting with the Google Gemini API.

### 3. Authentication
*   **Responsibility**: Manages user identity and session security.
*   **Tasks**:
    *   Integrate a library like Next-Auth.
    *   Implement registration and login logic (e.g., password hashing and comparison).
    *   Secure API routes to ensure only authenticated users can access their own data.

### 4. Database (Vercel Postgres + Prisma)
*   **Responsibility**: Data persistence.
*   **Tasks**:
    *   Define the database schema in `prisma/schema.prisma` for Users, Folders (with self-relation for subfolders), and Ideas.
    *   Run `prisma migrate` to create and update the database tables.
    *   Use Prisma Client in API routes for all database queries.

---

## Development Plan

### Phase 1: Foundation & Setup
- [ ] Initialize Next.js project.
- [ ] Connect project to a new GitHub repository and Vercel project.
- [ ] Provision a Vercel Postgres database.
- [ ] Set up Prisma, define the initial schema, and run the first migration.

### Phase 2: Authentication
- [ ] Create `User` model in Prisma schema and migrate.
- [ ] Build API routes for user registration (`/api/auth/signup`) and login (`/api/auth/login`).
- [ ] Create frontend pages/components for signup and login forms.
- [ ] Implement client-side session handling.

### Phase 3: Migrating Core Features to API
- [ ] **Folders API**:
    - [ ] `GET /api/folders`: Fetch all folders for the authenticated user.
    - [ ] `POST /api/folders`: Create a new root folder or subfolder.
    - [ ] `PUT /api/folders/[id]`: Update a folder (e.g., rename).
    - [ ] `DELETE /api/folders/[id]`: Delete a folder.
- [ ] **Ideas API**:
    - [ ] `POST /api/ideas/swipe`: Handle a swipe action, creating/moving an idea to the correct folder.
    - [ ] `PUT /api/ideas/[id]/move`: Move an idea between folders.
    *   `PUT /api/ideas/[id]`: Update an idea's details (name, notes).
    - [ ] `DELETE /api/ideas/[id]`: Permanently delete an idea.
- [ ] **Frontend Refactor**:
    - [ ] Update Sidebar, FolderView, etc., to fetch data from and mutate data via the new API endpoints.

### Phase 4: Secure AI Generation
- [ ] Create a protected backend endpoint: `POST /api/generate-ideas`.
- [ ] Move Gemini API logic from `services/geminiService.ts` to this new endpoint. Store the `API_KEY` as a secure environment variable on Vercel.
- [ ] Refactor `SwipeScreen.tsx` to call `/api/generate-ideas`.

### Phase 5: Deployment & Finalization
- [ ] Thoroughly test all features in a production-like environment (Vercel Preview Deployments).
- [ ] Merge to the main branch to deploy to production.
- [ ] Monitor logs for any runtime errors.