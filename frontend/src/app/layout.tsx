import '../app/globals.css'
import React from 'react'

export const metadata = {
  title: 'AI-Powered Excel Mock Interviewer',
  description: 'Practice Excel interviews with an AI interviewer',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
