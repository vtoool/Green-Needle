
import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import React from 'react';

export const metadata: Metadata = {
  title: 'Green Needle - Brainstorming Companion',
  description: 'A brainstorming app that helps generate quick business, app, and feature ideas with AI. Collect, refine, and organize your best concepts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <Script id="dark-mode-handler">
          {`
            // On page load or when changing themes, best to add inline in \`head\` to avoid FOUC
            if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark')
            } else {
              document.documentElement.classList.remove('dark')
            }
          `}
        </Script>
      </head>
      <body className="bg-gray-100 dark:bg-brand-950 text-gray-900 dark:text-white antialiased transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
