import { useState, useEffect } from 'react'
import { getQ19, getQ20, getQ21 } from '../services/api'
import { GroupedBarChart } from '../components/charts/index'
import LLMInsightCard from '../components/LLMInsightCard'
import AnalysisApproach from '../components/AnalysisApproach'

const TABS = [
  { id: 'q19', label: 'Resignation Factors', sub: 'Q19', hasLLM: true, question: 'What factors most strongly contribute to Employee Resignation using multi-variable reasoning?', columns: ['Employee_Resignation_Status', 'Department', 'Performance_Rating', 'Overtime_Hours_Per_Week'], approach: 'Computed the mean of every numeric column separately for Resigned and Retained employees. Ranked all features by the absolute mean difference between groups. The top 10 differentiating features are displayed as a grouped bar. AI applies multi-factor reasoning — comparing at least two variables and identifying causality direction — to surface the strongest drivers of resignation.' },
  { id: 'q20', label: 'Risk Profile',         sub: 'Q20', hasLLM: true, question: 'Which behavioral and compensation features define a risk profile of employees likely to resign?', columns: ['Employee_Resignation_Status', 'Employee_Engagement_Score', 'Annual_Salary_Increase_Percentage', 'Employee_Work_Life_Balance_Rating'], approach: 'Defined the at-risk profile as all employees who have already resigned. Extracted their mean behavioural and compensation feature values. Compared these directly against the full-workforce average. The grouped bar chart visualises the statistical gap. AI identifies the combination of signals that together form a resign-risk signature for proactive HR intervention.' },
  { id: 'q21', label: 'Work-Life Balance',    sub: 'Q21', question: 'How do work-life balance, overtime hours and engagement scores differ between resigned and retained employees?', columns: ['Employee_Work_Life_Balance_Rating', 'Overtime_Hours_Per_Week', 'Employee_Engagement_Score', 'Employee_Resignation_Status'], approach: 'Grouped all employees by Resignation_Status. Computed three key wellness metrics for each group: Work_Life_Balance_Rating, Overtime_Hours_Per_Week, and Employee_Engagement_Score. Grouped bars show how each metric differs between employees who stayed and those who left — isolating whether overwork or low engagement is the stronger attrition predictor.' },
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
          {TABS.find(t => t.id === tab)?.columns && (
            <p className="text-xs text-slate-600 mt-1">
              <span className="text-slate-500">Fields: </span>
              {TABS.find(t => t.id === tab).columns.join(' · ')}
            </p>
          )}
        </div>
      )}

      <AnalysisApproach approach={TABS.find(t => t.id === tab)?.approach} />

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
