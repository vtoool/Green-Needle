# Green Needle - Technical Roadmap

This document outlines the core modules and a strategic development plan for transitioning the current client-side application to a robust, full-stack architecture.

## Core Modules

### 1. Frontend (Next.js App Router)
*   **Responsibility**: UI/UX, client-side interactivity, and invoking server-side logic.
*   **Strategy**:
    *   Leverage Next.js Server Components for initial data fetching to improve performance and reduce client-side bundle size.
    *   Refactor existing React components into a logical structure within the `app/` directory.
    *   Utilize Client Components for interactive elements (e.g., swipe gestures, forms).
    *   Manage user session state globally using React Context integrated with Supabase's auth helpers.

### 2. Backend Logic (Next.js & Vercel)
*   **Responsibility**: Business logic, data validation, and secure handling of third-party API calls.
*   **Strategy**:
    *   **Minimize API Routes**: Avoid creating boilerplate API routes for simple CRUD operations. Instead, query Supabase directly from Server Components or use Server Actions.
    *   **Utilize Server Actions**: Implement mutations (creating/updating data) using Next.js Server Actions for a streamlined, full-stack developer experience. This simplifies form submissions and client-side state management.
    *   **Secure Secret Management**: Use a dedicated API Route (`/api/generate`) or a Server Action to handle requests to the Google Gemini API, ensuring the `API_KEY` remains secure on the server and is never exposed to the client.

### 3. Data & Auth (Supabase)
*   **Responsibility**: Data persistence, user authentication, and complex business logic via database functions.
*   **Strategy**:
    *   **Schema & RLS**: Define a clear database schema and enforce strict Row Level Security (RLS) to ensure users can only access their own data.
    *   **Postgres Functions (RPC)**: Encapsulate complex, multi-step business logic (e.g., `handle_swipe`, `move_idea`, `handle_tournament_win`) into Postgres functions. This ensures data integrity, atomicity, and performance by executing logic directly within the database.
    *   **Authentication**: Use Supabase's built-in authentication to manage user sign-up, login, and session handling.

---

## Development Plan

### Phase 1: Foundation & Setup
- [ ] Initialize Next.js project and set up Vercel deployment.
- [ ] Create a new Supabase project and configure environment variables.
- [ ] Define and create the database schema (Users, Folders, Ideas) in Supabase.
- [ ] Implement and test rigorous Row Level Security (RLS) policies for all tables.

### Phase 2: Authentication
- [ ] Integrate `@supabase/auth-helpers-nextjs` for server-side and client-side session management.
- [ ] Create UI components for user signup, login, and logout.
- [ ] Implement protected routes/layouts that require an authenticated user.

### Phase 3: Data Logic & Migration
- [ ] **Database Functions**: Re-implement core business logic from `App.tsx` (e.g., `handleSwipe`, `moveIdea`) as atomic Postgres functions (RPCs) in Supabase.
- [ ] **Server Components**: Refactor read-only views (like `FolderView`) to fetch data directly from Supabase within Next.js Server Components.
- [ ] **Client Components & Server Actions**: Refactor interactive components (`SwipeScreen`, forms) to use Server Actions that call the Supabase client and Postgres functions for mutations.
- [ ] **Data Seeding**: Create a script to seed the database with initial data for development and testing.

### Phase 4: Secure AI Generation
- [ ] Implement a secure Server Action or API Route (`/api/generate-ideas`) that authenticates the user's session.
- [ ] Move the Gemini API logic into this server-side function, using the securely stored `API_KEY`.
- [ ] Refactor `SwipeScreen.tsx` to call this Server Action/endpoint to generate new ideas.

### Phase 5: Deployment & Finalization
- [ ] Conduct end-to-end testing on Vercel Preview Deployments.
- [ ] Validate all RLS policies to prevent data leaks.
- [ ] Merge to the main branch for production deployment.
- [ ] Set up monitoring and logging on Vercel.
---

## Workflow Learnings & Notes

*   **AI Content vs. UI Constraints**: There is a constant tension between generating rich, detailed content from the AI and fitting it cleanly into fixed-size UI elements like cards. Past iterations struggled with cards having either too much whitespace (content too short) or ugly scrollbars (content too long). **Solution**: The ideal workflow involves a two-pronged approach:
    1.  **Prompt Engineering**: Be very specific in the AI prompt about the desired output length (e.g., "a single compelling sentence," "a short phrase, max 10 words").
    2.  **Defensive CSS**: Always implement safeguards in the UI. Using CSS properties like `line-clamp` is crucial to gracefully truncate any text that unexpectedly exceeds the desired length. This combination ensures the UI remains consistent and never "breaks," regardless of the AI's output.