import { useState, useEffect } from 'react'
import { getQ6, getQ7, getQ8, getQ9, getQ10 } from '../services/api'
import { GroupedBarChart, SingleBarChart } from '../components/charts/index'
import LLMInsightCard from '../components/LLMInsightCard'

const TABS = [
  { id: 'q6',  label: 'Dev Hours vs Performance', sub: 'Q6',  question: 'Do Professional Development Hours correlate with Performance Rating and number of Promotions?' },
  { id: 'q7',  label: 'Mentor Impact',             sub: 'Q7',  hasLLM: true, question: 'How does Mentor Rating and Experience Level affect internship conversion and employee performance?' },
  { id: 'q8',  label: 'Trained but Low Perf',      sub: 'Q8',  hasLLM: true, question: 'Which employees received training but still show low performance improvement, and what are the likely causes?' },
  { id: 'q9',  label: 'Basic vs Advanced',          sub: 'Q9',  question: 'How do Basic vs Advanced training programs differ in their effect on performance and career growth?' },
  { id: 'q10', label: 'Training Candidates',        sub: 'Q10', hasLLM: true, question: 'Which employees are most likely to benefit from advanced training programs based on current performance patterns?' },
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

export default function Section2() {
  const [tab, setTab] = useState('q6')
  const q6 = useAnalysis(getQ6)
  const q7 = useAnalysis(getQ7)
  const q8 = useAnalysis(getQ8)
  const q9 = useAnalysis(getQ9)
  const q10 = useAnalysis(getQ10)
  const analyses = { q6, q7, q8, q9, q10 }

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

      {/* Q6 */}
      {tab === 'q6' && (
        <div className="space-y-4">
          {current.data?.correlations && (
            <div className="grid grid-cols-2 gap-4">
              {[['Hours ↔ Performance', current.data.correlations.hoursVsPerformance], ['Hours ↔ Promotions', current.data.correlations.hoursVsPromotions]].map(([label, val]) => (
                <div key={label} className="card p-4 text-center border-brand-500/20">
                  <p className="text-brand-400 text-2xl font-bold">{val}</p>
                  <p className="text-slate-400 text-xs mt-1">Pearson r — {label}</p>
                </div>
              ))}
            </div>
          )}
          <div className="card p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Training Program vs Dev Hours / Performance / Promotions</h3>
            {current.loading ? <div className="h-52 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
              : current.data ? <GroupedBarChart data={current.data.chartData} keys={['Professional_Development_Hours', 'Performance_Rating', 'Number_Of_Promotions']} xKey="group" height={280} />
              : null}
          </div>
        </div>
      )}

      {/* Q7 — LLM */}
      {tab === 'q7' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Performance & Conversion by Mentor Experience Level</h3>
              {current.loading ? <div className="h-48 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
                : current.data ? <GroupedBarChart data={current.data.chartData} keys={['Performance_Rating', 'conversionRate']} xKey="group" height={240} />
                : null}
            </div>
            {!current.loading && current.data?.ratingChartData && (
              <div className="card p-5">
                <h3 className="text-white font-semibold text-sm mb-4">By Mentor Rating Bucket</h3>
                <GroupedBarChart data={current.data.ratingChartData} keys={['avgPerformance', 'conversionRate']} xKey="bucket" height={200} />
              </div>
            )}
          </div>
          <LLMInsightCard insight={current.data?.insight} loading={current.loading} />
        </div>
      )}

      {/* Q8 — LLM */}
      {tab === 'q8' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Trained but Low Performance — by Department</h3>
            {current.loading ? <div className="h-52 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
              : current.data ? (
                <>
                  <SingleBarChart data={current.data.chartData} dataKey="count" xKey="name" />
                  {current.data.summary && (
                    <div className="mt-4 grid grid-cols-2 gap-3 text-center text-xs">
                      <div className="bg-surface-600 rounded-lg p-3">
                        <p className="text-red-400 text-xl font-bold">{current.data.summary.pctNoMentor}%</p>
                        <p className="text-slate-400 mt-1">Have no mentor</p>
                      </div>
                      <div className="bg-surface-600 rounded-lg p-3">
                        <p className="text-brand-400 text-xl font-bold">{current.data.summary.pctHighOvertime}%</p>
                        <p className="text-slate-400 mt-1">High overtime (&gt;10h)</p>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
          </div>
          <LLMInsightCard insight={current.data?.insight} loading={current.loading} />
        </div>
      )}

      {/* Q9 */}
      {tab === 'q9' && (
        <div className="card p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Training Program Effectiveness — Performance & Promotions</h3>
          {current.loading ? <div className="h-64 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
            : current.data ? <GroupedBarChart data={current.data.chartData} keys={['Performance_Rating', 'Number_Of_Promotions']} xKey="group" height={300} />
            : null}
        </div>
      )}

      {/* Q10 — LLM */}
      {tab === 'q10' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Mid-Performers by Department (Training Candidates)</h3>
            {current.loading ? <div className="h-52 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
              : current.data ? (
                <>
                  <SingleBarChart data={current.data.chartData} dataKey="count" xKey="group" />
                  <p className="text-slate-500 text-xs mt-3 text-center">
                    Total mid-performers (6–9 rating): <span className="text-brand-400 font-semibold">{current.data.totalMidPerformers}</span>
                  </p>
                </>
              ) : null}
          </div>
          <LLMInsightCard insight={current.data?.insight} loading={current.loading} />
        </div>
      )}
    </div>
  )
}
