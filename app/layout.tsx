/* eslint-disable @next/next/no-html-link-for-pages */

import './globals.css'
import React from 'react'

export const metadata = {
  title: 'RLS Guard Dog',
  description: 'RLS Guard Dog - demo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900">
        <header className="border-b">
          <nav className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="text-lg font-semibold">RLS Guard Dog</div>
            <div className="space-x-4">
              <a href="/" className="hover:underline">Home</a>
              <a href="/student" className="hover:underline">Student</a>
              <a href="/teacher" className="hover:underline">Teacher</a>
            </div>
          </nav>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
