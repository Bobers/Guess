import React from 'react';
import Head from 'next/head';

export default function Layout({ children, title = 'guessright - Discover Your Ideal Customer Profile' }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Identify your ideal customer profile through interactive questions" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center">
          <a href="/" className="flex items-center">
            <span className="text-xl font-bold text-blue-600">guessright</span>
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} guessright. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}