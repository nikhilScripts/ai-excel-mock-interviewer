"use client"
import React, { useEffect, useState } from 'react'

export default function ReportPage() {
  const [report, setReport] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

  useEffect(() => {
    const load = async () => {
      try {
        setError(null)
        const sid = sessionStorage.getItem('session_id')
        const res = await fetch(`${API_BASE}/report`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sid }) })
        const data = await res.json()
        setReport(data)
      } catch (e) {
        setError('Cannot reach backend for report.')
      }
    }
    load()
  }, [])

  if (error) return <div className="p-6 text-red-400">{error}</div>
  if (!report) return <div className="p-6">Loading report...</div>

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Candidate Performance Report</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 p-3 rounded">Theory: {report.theory}/20</div>
        <div className="bg-slate-900 p-3 rounded">Practical: {report.practical}/40</div>
        <div className="bg-slate-900 p-3 rounded">Efficiency: {report.efficiency}/20</div>
        <div className="bg-slate-900 p-3 rounded">Communication: {report.communication}/20</div>
      </div>
      <div className="bg-slate-900 p-3 rounded">Total: {report.total}/100</div>
      <div className="bg-slate-900 p-3 rounded">Feedback: {report.feedback}</div>
    </div>
  )
}
