"use client"
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type Message = { role: 'ai' | 'user'; text: string }

export default function InterviewPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [gridData, setGridData] = useState<any[][]>(Array.from({ length: 6 }, () => Array.from({ length: 6 }, () => '')))
  const [sessionId, setSessionId] = useState<string>('')
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000'
  const [error, setError] = useState<string | null>(null)
  const [completed, setCompleted] = useState<boolean>(false)

  useEffect(() => {
    const start = async () => {
      try {
        setError(null)
        const res = await fetch(`${API_BASE}/start`, { method: 'POST' })
        const data = await res.json()
        setSessionId(data.session_id)
        try { sessionStorage.setItem('session_id', data.session_id) } catch {}
        setMessages([{ role: 'ai', text: data.question }])
      } catch (e) {
        setError('Cannot reach backend. Check that the server on port 8000 is running.')
      }
    }
    start()
  }, [])

  const sendAnswer = async () => {
    if (!input.trim()) return
    if (!sessionId) {
      setError('Session not ready yet. Please wait a second and try again.')
      return
    }
    const userMsg: Message = { role: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    try {
      setError(null)
      const controller = new AbortController()
      const id = setTimeout(() => controller.abort(), 8000)
      const res = await fetch(`${API_BASE}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, answer: userMsg.text }),
        mode: 'cors',
        signal: controller.signal,
      })
      clearTimeout(id)
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`)
      }
      const data = await res.json()
      if (data.next_question) {
        setMessages(prev => [...prev, { role: 'ai', text: data.feedback }, { role: 'ai', text: data.next_question }])
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: data.feedback }, { role: 'ai', text: 'Interview complete. You can submit the grid and view the report.' }])
        setCompleted(true)
      }
    } catch (e: any) {
      setError(`Failed to send answer. ${e?.message ?? ''}`)
    }
  }

  const submitGrid = async () => {
    try {
      setError(null)
      const res = await fetch(`${API_BASE}/grid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, grid: gridData })
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`)
      }
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'ai', text: `Grid scored: ${data.score}/40` }])
    } catch (e: any) {
      setError(`Failed to submit grid. ${e?.message ?? ''}`)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <div className="bg-slate-900 rounded-lg p-4 h-[80vh] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'ai' ? 'text-emerald-300' : 'text-sky-200'}>
              <span className="font-semibold mr-2">{m.role === 'ai' ? 'AI' : 'You'}:</span>{m.text}
            </div>
          ))}
          {error && (
            <div className="text-red-400">{error}</div>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 bg-slate-800 rounded px-3 py-2" placeholder="Type your answer..." />
          <button onClick={sendAnswer} className="px-4 py-2 bg-emerald-600 rounded">Send</button>
        </div>
        <div className="mt-4 text-sm opacity-70">
          <Link href="/report" className="underline">Finish and view report</Link>
        </div>
      </div>
      <div className="bg-slate-900 rounded-lg p-4 h-[80vh] flex flex-col">
        <div className="text-sm mb-2 opacity-80">Simple grid (type values like =2+2)</div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-black">
            <tbody>
              {gridData.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="border border-slate-700">
                      <input
                        className="w-full px-2 py-1"
                        value={cell as string}
                        onChange={(e) => {
                          const next = gridData.map(r => [...r])
                          next[rIdx][cIdx] = e.target.value
                          setGridData(next)
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={submitGrid} className="mt-3 px-4 py-2 bg-sky-600 rounded self-start">Submit Grid</button>
      </div>
    </div>
  )
}
