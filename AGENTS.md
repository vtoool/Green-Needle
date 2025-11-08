# Idea Swipe - Agent & Feature Progress

This document tracks the core "agents" (modules) of our application and their development progress as we transition to a full-stack architecture.

## Core Agents

### 1. Frontend Agent (React SPA)
*   **Responsibility**: Manages all user interface and user experience. Renders the swipe cards, folders, and user interactions.
*   **Current State**: Fully functional as a client-side only application using `localStorage`.
*   **Future State**: Will be refactored to communicate with the Backend Agent via a REST API for all data operations. It will also handle UI for authentication (login/signup pages) and manage the user's session state.

### 2. Backend Agent (Next.js API)
*   **Responsibility**: The "brain" of the application. Handles business logic, data validation, and communication between the frontend, database, and AI service.
*   **Future State**: Will expose a REST API for the frontend to consume. All data-mutating logic (creating folders, moving ideas) will live here.

### 3. Authentication Agent
*   **Responsibility**: Manages user identity, including registration, login, and session management.
*   **Future State**: Will handle creating new users, verifying credentials, and issuing secure session tokens (e.g., JWTs) to the frontend.

### 4. Database Agent (Vercel Postgres)
*   **Responsibility**: Persistently stores all application data.
*   **Future State**: Will store user accounts, ideas, folders, and the relationships between them. Replaces `localStorage`.

### 5. AI Agent (Gemini Service on Backend)
*   **Responsibility**: Securely interacts with the Google Gemini API to generate ideas.
*   **Future State**: The API key will be stored securely on the backend. The frontend will request new ideas from our Backend Agent, which will then call the Gemini API. This protects our API key.

---

## Feature Development Plan

### Phase 1: Project Setup & Backend Foundation
- [ ] Initialize a Next.js project structure.
- [ ] Set up the database schema (Users, Ideas, Folders).
- [ ] Create basic API endpoints for fetching data.

### Phase 2: Authentication
- [ ] Create User model and database table.
- [ ] Implement user registration (signup) endpoint.
- [ ] Implement user login endpoint.
- [ ] Create signup and login pages on the frontend.
- [ ] Implement client-side session management (e.g., React Context).

### Phase 3: Migrating Core Features to Backend
- [ ] **Folders**:
    - [ ] API endpoint to `GET` all folders for a user.
    - [ ] API endpoint to `POST` (create) a new folder/subfolder.
    - [ ] Frontend logic to fetch and display folders from the API.
- [ ] **Ideas**:
    - [ ] API endpoint to handle swiping (move idea to 'liked' or 'trashed').
    - [ ] API endpoint to move an idea between folders.
    - [ ] API endpoint to `PUT` (update) an idea's details (name, notes, etc.).
    - [ ] API endpoint to `DELETE` an idea.
    - [ ] Refactor frontend components (FolderView, IdeaDetailView) to use these new API endpoints.

### Phase 4: AI Idea Generation
- [ ] Create a secure backend endpoint (`/api/generate-ideas`).
- [ ] Move Gemini API call logic from the frontend `geminiService.ts` to the backend endpoint.
- [ ] Refactor `SwipeScreen.tsx` to call our backend API for new ideas instead of calling Gemini directly.

### Phase 5: Deployment
- [ ] Set up a GitHub repository.
- [ ] Configure Vercel for deployment.
- [ ] Manage environment variables (database connection string, API keys) in Vercel.
- [ ] Deploy to production!
