# Developer Guide (Explain Like I'm 5)

Welcome to Idea Swipe! This guide will explain how our app works in a simple way.

## What Are We Building? 🧸

Imagine you have a magic toy box that gives you new toy ideas. You can look at an idea, and if you like it, you put it on your "keeper" shelf. If you don't, you put it in the "toss" bin. Later, you can look at all the cool toys on your shelf!

Our app is like that magic toy box, but for business ideas. We are turning it from a simple toy that only you can play with (and forgets everything if you close it) into a real, shareable app that remembers everything for you online.

## The Big Picture: Building with LEGOs 🧱

Our app has three main parts, just like building a big LEGO castle.

#### 1. The Frontend (Your Awesome LEGO Castle)
This is the part you see and touch. It's the colorful swipe cards, the buttons, and the folders. It's what makes the app look cool and fun to use.
*   **Our LEGOs**: React

#### 2. The Backend (The LEGO Instruction Book)
This is the secret rulebook. When you swipe right on an idea, the Frontend tells the Backend, "Hey, they liked this one!" The Backend then follows the instructions to save it in the right place. It also holds the secret key to talk to the magic idea generator (Gemini).
*   **Our Instruction Book**: Next.js (on a server)

#### 3. The Database (The Big LEGO Box)
This is where we keep all our LEGOs (our ideas, our user accounts, our folders) safe. When you close the app and come back later, the Backend asks the Database, "Hey, what ideas did this person save?" and gets them for you. It's our app's memory.
*   **Our LEGO Box**: Vercel Postgres

## Our Tech Stack (Our Official LEGO Kit) 🚀

*   **Next.js (React)**: The main building block for both our Frontend and Backend. It's great because it lets us build both parts in one place.
*   **Gemini API**: The magical machine that comes up with all the cool new ideas for us.
*   **Vercel**: The playground where our LEGO castle lives so everyone on the internet can visit it. It's where we'll host our app.
*   **GitHub**: The blueprint library where we store the plans for our castle, so we can track all the changes we make.

## The Plan (Building the Castle Step-by-Step) 🗺️

We're going to build this in a few big steps. You can follow our progress in `AGENTS.md`.

1.  **Get the New LEGOs**: We'll switch our project to use Next.js, which lets us build a frontend and backend together.
2.  **Build the LEGO Box**: We'll set up our database to hold users, ideas, and folders.
3.  **Create a Clubhouse Key**: We'll add a login and signup page so only registered users can have their own private collection of ideas.
4.  **Rewrite the Instruction Book**: We'll move all the rules (like what happens when you swipe) from the frontend to our new backend. This makes our app smarter and more secure.
5.  **Connect Everything**: We'll teach the Frontend how to talk to the Backend to save and get ideas.
6.  **Open the Playground**: We'll put our finished app on Vercel so the whole world can use it!

That's the plan! It's a big project, but by doing it one step at a time, we'll build something amazing.
