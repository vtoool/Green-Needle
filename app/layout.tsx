
import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
// FIX: Import React to make the `React` namespace available for types like `React.ReactNode`.
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
        <Script id="tailwind-cdn" src="https://cdn.tailwindcss.com" />
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
        <Script id="tailwind-config">
          {`
            tailwind.config = {
              darkMode: 'class',
              theme: {
                extend: {
                  fontFamily: {
                    sans: ['Inter', 'sans-serif'],
                  },
                  colors: {
                    brand: {
                      DEFAULT: '#22c55e', // green-500
                      '50': '#f0fdf4',
                      '100': '#dcfce7',
                      '200': '#bbf7d0',
                      '300': '#86efac',
                      '400': '#4ade80',
                      '500': '#22c55e',
                      '600': '#16a34a',
                      '700': '#15803d',
                      '800': '#1B2D23',
                      '900': '#101C14',
                      '950': '#0A1410',
                    },
                  }
                },
              },
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
