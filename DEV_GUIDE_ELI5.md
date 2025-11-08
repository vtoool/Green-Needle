# Full-Stack Migration & Developer Guide

This guide outlines the technical steps to transition the client-side React application into a full-stack Next.js project, complete with a database, authentication, and Vercel deployment.

## Tech Stack

*   **Framework**: Next.js (App Router)
*   **Backend-as-a-Service**: Supabase (Database, Auth, Storage)
*   **Deployment**: Vercel

---

## Step-by-Step Setup Guide

### 1. Project Setup: Migrating to Next.js

The current `create-react-app`-style structure will be migrated into a Next.js project.

1.  **Initialize Next.js**:
    ```bash
    npx create-next-app@latest green-needle-app
    ```
2.  **Structure Migration**:
    *   Move the existing React components from `./components` into the `app/components` directory of the new Next.js project.
    *   The main `App.tsx` logic will be broken down and moved into Next.js pages/layouts (e.g., `app/layout.tsx` and `app/page.tsx`).
    *   Static assets and `index.html` content (like fonts) will be configured in `app/layout.tsx`.
    *   The API service `geminiService.ts` will be moved to a backend API route.

### 2. Version Control & Deployment Host

1.  **GitHub Repository**: Create a new repository on GitHub and push the Next.js project to it.
2.  **Vercel Project**:
    *   Sign up for a Vercel account.
    *   Create a "New Project" and import the GitHub repository you just created.
    *   Vercel will automatically detect the Next.js framework and configure the build settings.

### 3. Backend Setup (Supabase)

Supabase will handle our database and user authentication.

1.  **Create Supabase Project**:
    *   Go to [supabase.com](https://supabase.com), create an account, and start a "New Project".
    *   Give it a name and generate a secure database password (save this password!).

2.  **Get API Keys**:
    *   Once the project is ready, go to "Project Settings" > "API".
    *   You'll find your **Project URL** and `anon` **public key**.
    *   Copy these into a new `.env.local` file in your Next.js project:
        ```
        NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL
        NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
        ```
    *   Also, add these as Environment Variables in your Vercel project settings.

3.  **Define the Schema (SQL)**:
    *   Go to the "SQL Editor" in your Supabase dashboard.
    *   Create a new query and run the SQL code below to create your tables. This replaces the `schema.prisma` file. Supabase automatically links tables based on foreign keys.

    ```sql
    -- Users table is managed by Supabase Auth, we just reference it.

    -- Folders Table
    create table public.folders (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      theme text,
      created_at timestamptz default now() not null,
      user_id uuid references auth.users(id) on delete cascade not null,
      parent_id uuid references public.folders(id) on delete cascade -- self-referencing for subfolders
    );

    -- Ideas Table
    create table public.ideas (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      description text not null,
      features text[] not null,
      notes text,
      created_at timestamptz default now() not null,
      folder_id uuid references public.folders(id) on delete cascade not null,
      user_id uuid references auth.users(id) on delete cascade not null -- for easier RLS policies
    );

    -- Enable Row Level Security (RLS) for all tables
    alter table public.folders enable row level security;
    alter table public.ideas enable row level security;

    -- RLS Policies: Allow users to manage their own data
    create policy "Users can view their own folders" on public.folders
      for select using (auth.uid() = user_id);

    create policy "Users can insert their own folders" on public.folders
      for insert with check (auth.uid() = user_id);

    create policy "Users can update their own folders" on public.folders
      for update using (auth.uid() = user_id);

    create policy "Users can delete their own folders" on public.folders
      for delete using (auth.uid() = user_id);


    create policy "Users can view their own ideas" on public.ideas
      for select using (auth.uid() = user_id);

    create policy "Users can insert their own ideas" on public.ideas
      for insert with check (auth.uid() = user_id);

    create policy "Users can update their own ideas" on public.ideas
      for update using (auth.uid() = user_id);

    create policy "Users can delete their own ideas" on public.ideas
      for delete using (auth.uid() = user_id);
    ```

4.  **Install Supabase Client**:
    *   Install the official Supabase helper library for Next.js:
        ```bash
        npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
        ```
    *   This will help you manage user sessions and interact with your database easily.

### 4. Backend Development: API Routes & Server Components

Instead of creating many API routes for simple database actions, Supabase allows you to securely query your data directly from the frontend (thanks to RLS) or from Next.js Server Components.

*   **Authentication**: Use the Supabase client library functions like `supabase.auth.signUp()` and `supabase.auth.signInWithPassword()` directly in your frontend components.
*   **Data Operations**: Fetch and modify data using the Supabase client (e.g., `supabase.from('folders').select('*')`). This can be done in Server Components for initial data loads or in Client Components for interactive updates.
*   **Secure AI Generation**: The Gemini API call should still be in a dedicated API Route (`/api/generate`) to protect your `API_KEY`. This route will be protected using Supabase session checks.

### 5. Frontend Refactoring

Finally, update the frontend components to use Supabase:
*   Remove all `localStorage` logic.
*   Wrap your application in a Supabase provider to manage auth state.
*   Fetch initial data in Server Components by creating a server-side Supabase client.
*   All user actions (swiping, moving, creating folders) should now call Supabase client functions (`supabase.from('ideas').insert(...)`).
*   Use Supabase's real-time subscriptions to automatically update the UI when database changes occur, creating a live and responsive experience.