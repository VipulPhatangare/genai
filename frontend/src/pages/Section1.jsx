import { useState, useEffect } from 'react'
import { getQ1, getQ2, getQ3, getQ4, getQ5 } from '../services/api'
import { GroupedBarChart, SingleBarChart, RadarChartComp, HorizontalBarChart } from '../components/charts/index'
import LLMInsightCard from '../components/LLMInsightCard'
import StatCard from '../components/StatCard'
import { TrendingUp, Target, Users, AlertTriangle } from 'lucide-react'

const TABS = [
  { id: 'q1', label: 'Weighted Scoring', sub: 'Q1', question: 'How do Technical, Communication & Problem-Solving skills collectively influence Performance Rating?' },
  { id: 'q2', label: 'High Perf / Low Leadership', sub: 'Q2', hasLLM: true, question: 'Which employees show high performance but low leadership potential, and what are the likely reasons?' },
  { id: 'q3', label: 'High vs Low Patterns', sub: 'Q3', question: 'What behavioral patterns separate high performers (≥10) from low performers (≤5)?' },
  { id: 'q4', label: 'Skill-Outcome Gap', sub: 'Q4', hasLLM: true, question: 'Where do high skill ratings not align with actual project outcomes, and what explains the anomaly?' },
  { id: 'q5', label: 'Ideal Employee Profile', sub: 'Q5', question: 'What defines an ideal employee based on the top 10% performers across all rating columns?' },
]

function useAnalysis(fetchFn) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function load() {
    setLoading(true)
    setError(null)
    fetchFn()
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }

  return { data, loading, error, load }
}

export default function Section1() {
  const [tab, setTab] = useState('q1')
  const q1 = useAnalysis(getQ1)
  const q2 = useAnalysis(getQ2)
  const q3 = useAnalysis(getQ3)
  const q4 = useAnalysis(getQ4)
  const q5 = useAnalysis(getQ5)

  const analyses = { q1, q2, q3, q4, q5 }

  useEffect(() => {
    analyses[tab].load()
  }, [tab])

  const current = analyses[tab]

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Tab bar */}
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              tab === t.id ? 'tab-active' : 'tab-inactive'
            }`}>
            <span>{t.label}</span>
            <span className="ml-1.5 opacity-50">{t.sub}</span>
            {t.hasLLM && <span className="ml-1.5 text-brand-500">✦</span>}
          </button>
        ))}
      </div>

      {/* Active question label */}
      {TABS.find(t => t.id === tab)?.question && (
        <div className="px-3 py-2 rounded-lg bg-surface-600/50 border border-surface-500/40">
          <p className="text-xs text-slate-400 leading-relaxed">
            <span className="text-brand-400 font-semibold mr-1.5">{TABS.find(t => t.id === tab)?.sub}.</span>
            {TABS.find(t => t.id === tab)?.question}
          </p>
        </div>
      )}

      {current.error && (
        <div className="card p-4 border-red-500/20 bg-red-500/5">
          <p className="text-red-400 text-sm">{current.error}</p>
        </div>
      )}

      {/* Q1 — Weighted Scoring */}
      {tab === 'q1' && (
        <div className="space-y-4">
          {current.data?.formula && (
            <div className="card p-4 border-brand-500/20 bg-brand-500/5">
              <p className="text-xs text-brand-400 font-semibold uppercase tracking-wider mb-1">Performance Formula</p>
              <p className="text-white font-mono text-sm">Score = {current.data.formula}</p>
            </div>
          )}
          <div className="card p-5">
            <h3 className="text-white font-semibold mb-4 text-sm">Skill Correlations with Performance Rating</h3>
            {current.loading ? (
              <div className="h-48 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
            ) : current.data ? (
              <>
                <SingleBarChart data={current.data.chartData} dataKey="weightPct" xKey="name" />
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {current.data.chartData?.map(c => (
                    <div key={c.name} className="bg-surface-600 rounded-lg p-3 text-center">
                      <p className="text-brand-400 text-xl font-bold">{c.weightPct}%</p>
                      <p className="text-slate-400 text-xs mt-1">{c.name}</p>
                      <p className="text-slate-600 text-xs">r = {c.correlation}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Q2 — High Perf / Low Leadership (LLM) */}
      {tab === 'q2' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="text-white font-semibold mb-4 text-sm">High Performers with Low Leadership Potential — by Department</h3>
            {current.loading ? (
              <div className="h-48 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
            ) : current.data ? (
              <>
                <SingleBarChart data={current.data.chartData} dataKey="count" xKey="name" />
                {current.data.summary && (
                  <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                    <div className="bg-surface-600 rounded-lg p-3">
                      <p className="text-brand-400 text-xl font-bold">{current.data.summary.count}</p>
                      <p className="text-slate-400 text-xs mt-1">Employees in this group</p>
                    </div>
                    <div className="bg-surface-600 rounded-lg p-3">
                      <p className="text-brand-400 text-xl font-bold">{current.data.summary.avgMentorRating}</p>
                      <p className="text-slate-400 text-xs mt-1">Avg Mentor Rating</p>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
          <LLMInsightCard insight={current.data?.insight} loading={current.loading} />
        </div>
      )}

      {/* Q3 — High vs Low Patterns */}
      {tab === 'q3' && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Skill Profile: High (≥10) vs Low (≤5) Performers</h3>
            {current.data?.counts && (
              <div className="flex gap-3 text-xs">
                <span className="text-brand-400 font-medium">High: {current.data.counts.high}</span>
                <span className="text-slate-500 font-medium">Low: {current.data.counts.low}</span>
              </div>
            )}
          </div>
          {current.loading ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
          ) : current.data ? (
            <GroupedBarChart data={current.data.chartData} keys={['High', 'Low']} xKey="skill" height={300} />
          ) : null}
        </div>
      )}

      {/* Q4 — Skill-Outcome Gap (LLM) */}
      {tab === 'q4' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="text-white font-semibold mb-4 text-sm">High-Skill Employees with Failed Projects — by Complexity</h3>
            {current.loading ? (
              <div className="h-48 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
            ) : current.data ? (
              <>
                <SingleBarChart data={current.data.chartData} dataKey="count" xKey="name" />
                {current.data.summary && (
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-surface-600 rounded-lg p-3">
                      <p className="text-red-400 text-lg font-bold">{current.data.summary.highSkillFailedCount}</p>
                      <p className="text-slate-400 text-xs mt-1">High-Skill, Failed</p>
                    </div>
                    <div className="bg-surface-600 rounded-lg p-3">
                      <p className="text-brand-400 text-lg font-bold">{current.data.summary.avgSkillScore}</p>
                      <p className="text-slate-400 text-xs mt-1">Avg Skill Score</p>
                    </div>
                    <div className="bg-surface-600 rounded-lg p-3">
                      <p className="text-brand-400 text-lg font-bold">{current.data.summary.avgOvertimeHours}h</p>
                      <p className="text-slate-400 text-xs mt-1">Avg Overtime/Wk</p>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
          <LLMInsightCard insight={current.data?.insight} loading={current.loading} />
        </div>
      )}

      {/* Q5 — Ideal Employee Profile */}
      {tab === 'q5' && (
        <div className="space-y-4">
          {current.data?.extras && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Top 10% Count" value={current.data.extras.count} icon={Users} color="brand" />
              <StatCard label="Avg Performance" value={current.data.extras.avgPerformance} icon={TrendingUp} color="emerald" />
              <StatCard label="Avg Dev Hours" value={current.data.extras.avgDevHours} icon={Target} color="blue" />
              <StatCard label="Avg Engagement" value={current.data.extras.avgEngagement} icon={TrendingUp} color="purple" />
            </div>
          )}
          <div className="card p-5">
            <h3 className="text-white font-semibold mb-4 text-sm">Ideal Employee Radar — Top 10% vs All Employees</h3>
            {current.loading ? (
              <div className="h-64 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
            ) : current.data ? (
              <RadarChartComp data={current.data.chartData} keys={['Top 10%', 'All Employees']} height={320} />
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
