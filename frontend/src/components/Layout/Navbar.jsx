import { useLocation, Link } from 'react-router-dom'
import { Upload, RefreshCw } from 'lucide-react'
import { clearCache } from '../../services/api'
import { useState } from 'react'

const TITLES = {
  '/dashboard':    { title: 'Dashboard',             sub: 'Overview of all HR metrics' },
  '/performance':  { title: 'Performance Analytics', sub: 'Sections 1 — Skills & Performance (Q1–Q5)' },
  '/training':     { title: 'Training & Mentorship',  sub: 'Section 2 — Development (Q6–Q10)' },
  '/behavioral':   { title: 'Behavioral Intelligence', sub: 'Section 3 — Soft Skills (Q11–Q14)' },
  '/projects':     { title: 'Project Performance',    sub: 'Section 4 — Work Outcomes (Q15–Q18)' },
  '/attrition':    { title: 'Attrition & Retention',  sub: 'Section 5 — Resignation Intelligence (Q19–Q21)' },
  '/compensation': { title: 'Compensation Analysis',  sub: 'Section 6 — Pay & Benefits (Q22–Q24)' },
  '/recruitment':  { title: 'Recruitment Effectiveness', sub: 'Section 7 — Hiring Sources (Q25)' },
  '/chat':         { title: 'AI Chat',                sub: 'RAG-powered natural language query' },
}

export default function Navbar() {
  const { pathname } = useLocation()
  const meta = TITLES[pathname] || { title: 'HR Analytics', sub: '' }
  const [clearing, setClearing] = useState(false)

  async function handleClearCache() {
    setClearing(true)
    try { await clearCache() } catch (_) {}
    setTimeout(() => setClearing(false), 1000)
  }

  return (
    <header className="h-14 bg-[#111218] border-b border-surface-500 flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="text-white font-semibold text-base leading-none">{meta.title}</h1>
        <p className="text-slate-500 text-xs mt-0.5">{meta.sub}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleClearCache}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-surface-600 transition-all border border-transparent hover:border-surface-500"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${clearing ? 'animate-spin' : ''}`} />
          {clearing ? 'Clearing...' : 'Clear Cache'}
        </button>
        <Link
          to="/upload"
          className="flex items-center gap-1.5 text-xs bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg transition-all font-medium"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload CSV
        </Link>
      </div>
    </header>
  )
}
