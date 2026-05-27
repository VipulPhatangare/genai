import { useState, useEffect } from 'react'
import { getQ11, getQ12, getQ13, getQ14 } from '../services/api'
import { GroupedBarChart, SingleBarChart, ScatterPlot } from '../components/charts/index'
import LLMInsightCard from '../components/LLMInsightCard'

const TABS = [
  { id: 'q11', label: 'Soft Skill Clusters',     sub: 'Q11', hasLLM: true, question: 'How do employees cluster based on Leadership, Teamwork, Adaptability & Creativity — and what describes each cluster?' },
  { id: 'q12', label: 'Conflict vs Teamwork',     sub: 'Q12', hasLLM: true, question: 'Why do some employees have high conflict resolution cases but low teamwork scores — what explains the contradiction?' },
  { id: 'q13', label: 'Engagement Impact',         sub: 'Q13', question: 'How does Employee Engagement Score impact Job Satisfaction and Retention rates?' },
  { id: 'q14', label: 'Initiative vs Innovation', sub: 'Q14', hasLLM: true, question: 'Why do high-initiative employees show low innovation contribution — what blockers are at play?' },
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

export default function Section3() {
  const [tab, setTab] = useState('q11')
  const q11 = useAnalysis(getQ11)
  const q12 = useAnalysis(getQ12)
  const q13 = useAnalysis(getQ13)
  const q14 = useAnalysis(getQ14)
  const analyses = { q11, q12, q13, q14 }

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

      {/* Q11 — Clusters */}
      {tab === 'q11' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Soft Skill Cluster Centers (KMeans k=4)</h3>
            {current.loading ? <div className="h-64 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
              : current.data ? (
                <>
                  <GroupedBarChart data={current.data.chartData} keys={['Leadership', 'Teamwork', 'Adaptability', 'Creativity']} xKey="cluster" height={260} />
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {current.data.chartData?.map(c => (
                      <div key={c.cluster} className="bg-surface-600 rounded-lg p-2.5 text-xs">
                        <p className="text-brand-400 font-semibold">{c.cluster}</p>
                        <p className="text-slate-400 mt-0.5">{c.size} members · Top dept: {c.topDept}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
          </div>
          <LLMInsightCard insight={current.data?.insight} loading={current.loading} />
        </div>
      )}

      {/* Q12 — Conflict vs Teamwork */}
      {tab === 'q12' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="text-white font-semibold text-sm mb-4">High Conflict + Low Teamwork — Scatter (highlighted)</h3>
              {current.loading ? <div className="h-52 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
                : current.data ? <ScatterPlot data={current.data.scatterData || []} xLabel="Conflict Cases" yLabel="Teamwork Rating" height={240} />
                : null}
            </div>
            {!current.loading && current.data?.chartData && (
              <div className="card p-5">
                <h3 className="text-white font-semibold text-sm mb-3">By Job Role</h3>
                <SingleBarChart data={current.data.chartData} dataKey="count" xKey="name" height={180} />
                {current.data.summary && (
                  <p className="text-center text-xs text-slate-500 mt-2">
                    {current.data.summary.count} employees ({current.data.summary.pctOfAll}% of total) in this quadrant
                  </p>
                )}
              </div>
            )}
          </div>
          <LLMInsightCard insight={current.data?.insight} loading={current.loading} />
        </div>
      )}

      {/* Q13 — Engagement */}
      {tab === 'q13' && (
        <div className="space-y-4">
          {current.data?.correlation !== undefined && (
            <div className="card p-4 border-brand-500/20 bg-brand-500/5 text-center">
              <p className="text-brand-400 text-3xl font-bold">{current.data.correlation}</p>
              <p className="text-slate-400 text-sm mt-1">Pearson r — Engagement ↔ Job Satisfaction</p>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Resignation Rate by Engagement Bucket</h3>
              {current.loading ? <div className="h-48 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
                : current.data ? <GroupedBarChart data={current.data.chartData} keys={['resignationRate', 'avgSatisfaction']} xKey="bucket" height={220} />
                : null}
            </div>
            <div className="card p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Engagement vs Satisfaction Scatter</h3>
              {current.loading ? <div className="h-48 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
                : current.data ? <ScatterPlot data={current.data.scatterData || []} xLabel="Engagement Score" yLabel="Job Satisfaction" height={220} />
                : null}
            </div>
          </div>
        </div>
      )}

      {/* Q14 — Initiative vs Innovation */}
      {tab === 'q14' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="text-white font-semibold text-sm mb-4">High Initiative / No Innovation Involvement — by Department</h3>
            {current.loading ? <div className="h-52 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
              : current.data ? (
                <>
                  <SingleBarChart data={current.data.chartData} dataKey="count" xKey="name" />
                  {current.data.summary && (
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-surface-600 rounded-lg p-3">
                        <p className="text-brand-400 text-xl font-bold">{current.data.summary.count}</p>
                        <p className="text-slate-400 mt-1">Employees</p>
                      </div>
                      <div className="bg-surface-600 rounded-lg p-3">
                        <p className="text-brand-400 text-xl font-bold">{current.data.summary.pctHighOvertime}%</p>
                        <p className="text-slate-400 mt-1">High overtime</p>
                      </div>
                      <div className="bg-surface-600 rounded-lg p-3">
                        <p className="text-brand-400 text-xl font-bold">{current.data.summary.pctJuniorRoles}%</p>
                        <p className="text-slate-400 mt-1">Junior roles</p>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
          </div>
          <LLMInsightCard insight={current.data?.insight} loading={current.loading} />
        </div>
      )}
    </div>
  )
}
