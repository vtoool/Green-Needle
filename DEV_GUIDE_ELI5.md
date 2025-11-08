# Full-Stack Migration & Developer Guide

This guide outlines the technical steps to transition the client-side React application into a full-stack Next.js project, complete with a database, authentication, and Vercel deployment.

## Tech Stack

*   **Framework**: Next.js (App Router)
*   **Database**: Vercel Postgres
*   **ORM**: Prisma
*   **Authentication**: Next-Auth (or a similar library)
*   **Deployment**: Vercel

---

## Step-by-Step Setup Guide

### 1. Project Setup: Migrating to Next.js

The current `create-react-app`-style structure will be migrated into a Next.js project.

1.  **Initialize Next.js**:
    ```bash
    npx create-next-app@latest idea-swipe-app
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

### 3. Database Setup (Vercel Postgres + Prisma)

1.  **Create Database**:
    *   In your Vercel project dashboard, navigate to the "Storage" tab.
    *   Select "Postgres" and create a new database.
    *   Once created, Vercel will provide connection strings. Select the `.env.local` tab and copy the `POSTGRES_URL_NONPOOLING` variable. This is what Prisma will use for migrations.

2.  **Integrate Prisma**:
    *   Install Prisma into your Next.js project:
        ```bash
        npm install prisma --save-dev
        npx prisma init
        ```
    *   This creates a `prisma` directory and a `schema.prisma` file. It also creates a `.env` file.
    *   In `.env`, set the `DATABASE_URL` to the connection string you copied from Vercel:
        ```
        DATABASE_URL="postgres://..."
        ```
    *   Also, add this variable to your Vercel project's Environment Variables settings for deployment.

3.  **Define the Schema**:
    *   Open `prisma/schema.prisma` and define your database models. This schema replaces the TypeScript types and `localStorage` structure.

    ```prisma
    // This is your Prisma schema file,
    // learn more about it in the docs: https://pris.ly/d/prisma-schema

    generator client {
      provider = "prisma-client-js"
    }

    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }

    model User {
      id        String   @id @default(cuid())
      email     String   @unique
      password  String // In a real app, this would be a hashed password
      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt

      folders   Folder[]
    }

    model Folder {
      id        String   @id @default(cuid())
      name      String
      theme     String?
      createdAt DateTime @default(now())

      userId    String
      user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

      parentId  String?
      parent    Folder?  @relation("SubFolders", fields: [parentId], references: [id], onDelete: Cascade)
      subFolders Folder[] @relation("SubFolders")

      ideas     Idea[]

      @@index([userId])
      @@index([parentId])
    }

    model Idea {
      id          String    @id @default(cuid())
      name        String
      description String
      features    String[]
      notes       String?
      createdAt   DateTime  @default(now())

      folderId    String
      folder      Folder    @relation(fields: [folderId], references: [id], onDelete: Cascade)

      @@index([folderId])
    }
    ```

4.  **Run Migration**:
    *   Apply this schema to your Vercel Postgres database by running the Prisma migrate command. This will generate the necessary SQL and create the tables.
    ```bash
    npx prisma migrate dev --name init
    ```
    *   This also generates the Prisma Client, which you'll use to talk to the database in your API routes.

### 4. Backend Development: API Routes

The business logic currently in `App.tsx` (e.g., `handleSwipe`, `moveIdea`) will be moved into Next.js API Routes (e.g., in `app/api/`).

*   `/api/auth/signup`: Create a new user.
*   `/api/auth/login`: Authenticate a user and create a session.
*   `/api/folders`: `GET` all folders for the logged-in user. `POST` to create a new folder.
*   `/api/ideas`: `POST` to handle a swipe. `PUT` to move an idea or update its content. `DELETE` to permanently delete an idea.
*   `/api/generate`: A secure route that takes a prompt/theme and calls the Gemini API using a server-side API key.

### 5. Frontend Refactoring

Finally, update the frontend components to use the new backend:
*   Remove all `localStorage` logic.
*   In `App.tsx` (or its new equivalent), use a library like `SWR` or `React Query` (or simple `fetch` calls) inside `useEffect` hooks to load initial data (folders, etc.) from your API.
*   All user actions (swiping, moving, creating folders) should now call `fetch` to your API endpoints instead of manipulating the local state directly. The state should be updated based on the API response to ensure consistency.