"use client"
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  return (
    <main className="flex items-center justify-center h-[80vh] text-center p-6">
      <div>
        <h1 className="text-3xl md:text-5xl font-bold mb-4">AI-Powered Excel Mock Interviewer</h1>
        <p className="opacity-90 mb-6">Practice Excel theory and hands-on tasks with an AI interviewer.</p>
        <button
          className="px-6 py-3 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
          onClick={() => router.push('/interview')}
        >
          Start Interview
        </button>
      </div>
    </main>
  )
}
