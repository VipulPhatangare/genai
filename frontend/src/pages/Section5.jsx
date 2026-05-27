import { useState, useEffect } from 'react'
import { getQ19, getQ20, getQ21 } from '../services/api'
import { GroupedBarChart } from '../components/charts/index'
import LLMInsightCard from '../components/LLMInsightCard'

const TABS = [
  { id: 'q19', label: 'Resignation Factors', sub: 'Q19', hasLLM: true, question: 'What factors most strongly contribute to Employee Resignation using multi-variable reasoning?' },
  { id: 'q20', label: 'Risk Profile',         sub: 'Q20', hasLLM: true, question: 'Which behavioral and compensation features define a risk profile of employees likely to resign?' },
  { id: 'q21', label: 'Work-Life Balance',    sub: 'Q21', question: 'How do work-life balance, overtime hours and engagement scores differ between resigned and retained employees?' },
]

function useAnalysis(fetchFn) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  function load() {
    setLoading(true); setError(null)
    fetchFn().then(r => setData(r.data)).catch(e => setError(e.response?.data?.error || e.message)).finally(() => setLoading(false))
  }
  return { data, loading, error, load }
}

export default function Section5() {
  const [tab, setTab] = useState('q19')
  const q19 = useAnalysis(getQ19)
  const q20 = useAnalysis(getQ20)
  const q21 = useAnalysis(getQ21)
  const analyses = { q19, q20, q21 }

  useEffect(() => { analyses[tab].load() }, [tab])
  const current = analyses[tab]

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${tab === t.id ? 'tab-active' : 'tab-inactive'}`}>
            {t.label} <span className="opacity-50 ml-1">{t.sub}</span>
            {t.hasLLM && <span className="ml-1 text-brand-500">✦</span>}
          </button>
        ))}
      </div>

      {TABS.find(t => t.id === tab)?.question && (
        <div className="px-3 py-2 rounded-lg bg-surface-600/50 border border-surface-500/40">
          <p className="text-xs text-slate-400 leading-relaxed">
            <span className="text-brand-400 font-semibold mr-1.5">{TABS.find(t => t.id === tab)?.sub}.</span>
            {TABS.find(t => t.id === tab)?.question}
          </p>
        </div>
      )}

      {current.error && <div className="card p-4 border-red-500/20"><p className="text-red-400 text-sm">{current.error}</p></div>}

      {/* Q19 */}
      {tab === 'q19' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="text-white font-semibold text-sm mb-2">Top 10 Factors — Resigned vs Retained (Mean Difference)</h3>
            {current.data?.summary && (
              <div className="flex gap-4 mb-4">
                <span className="badge-red">Resigned: {current.data.summary.resignedCount}</span>
                <span className="badge-green">Retained: {current.data.summary.retainedCount}</span>
                <span className="badge-orange">Rate: {current.data.summary.resignationRate}%</span>
              </div>
            )}
            {current.loading ? <div className="h-64 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
              : current.data ? <GroupedBarChart data={current.data.chartData} keys={['Resigned', 'Retained']} xKey="feature" height={300} />
              : null}
          </div>
          <LLMInsightCard insight={current.data?.insight} loading={current.loading} />
        </div>
      )}

      {/* Q20 */}
      {tab === 'q20' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="text-white font-semibold text-sm mb-4">At-Risk Profile vs All Employees</h3>
            {current.loading ? <div className="h-64 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
              : current.data ? <GroupedBarChart data={current.data.chartData} keys={['At-Risk Profile', 'All Employees']} xKey="feature" height={300} />
              : null}
          </div>
          <LLMInsightCard insight={current.data?.insight} loading={current.loading} />
        </div>
      )}

      {/* Q21 */}
      {tab === 'q21' && (
        <div className="card p-5">
          <h3 className="text-white font-semibold text-sm mb-2">Work-Life Balance Metrics — Resigned vs Retained</h3>
          {current.data?.counts && (
            <div className="flex gap-4 mb-4">
              <span className="badge-red">Resigned: {current.data.counts.resigned}</span>
              <span className="badge-green">Retained: {current.data.counts.retained}</span>
            </div>
          )}
          {current.loading ? <div className="h-64 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
            : current.data ? <GroupedBarChart data={current.data.chartData} keys={['Resigned', 'Retained']} xKey="metric" height={300} />
            : null}
        </div>
      )}
    </div>
  )
}
