import { useState, useEffect } from 'react'
import { getQ25 } from '../services/api'
import { GroupedBarChart } from '../components/charts/index'
import AnalysisApproach from '../components/AnalysisApproach'

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

export default function Section7() {
  const q25 = useAnalysis(getQ25)
  useEffect(() => { q25.load() }, [])

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="px-3 py-2 rounded-lg bg-surface-600/50 border border-surface-500/40">
        <p className="text-xs text-slate-400 leading-relaxed">
          <span className="text-brand-400 font-semibold mr-1.5">Q25.</span>
          How do Hiring Source, Time-to-Hire and Recruitment Cost impact employee performance, retention and job satisfaction?
        </p>
        <p className="text-xs text-slate-600 mt-1">
          <span className="text-slate-500">Fields: </span>
          Hiring_Source · Performance_Rating · Time_to_Hire · Recruitment_Cost · Employee_Resignation_Status
        </p>
      </div>

      <AnalysisApproach approach="Grouped all employees by Hiring_Source (LinkedIn, Referral, Job Board, Campus, etc.). For each source, computed average Performance_Rating, Job_Satisfaction_Score, Resignation_Rate, Time_to_Hire (days), and Recruitment_Cost. The three-chart layout separates quality metrics (performance, satisfaction), efficiency metrics (resignation rate, time-to-hire), and cost from a single cross-source comparison — identifying the most cost-effective and talent-quality-effective hiring channels." />

      {q25.error && <div className="card p-4 border-red-500/20"><p className="text-red-400 text-sm">{q25.error}</p></div>}

      <div className="card p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Hiring Source — Performance, Satisfaction & Retention</h3>
        {q25.loading ? <div className="h-64 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
          : q25.data ? <GroupedBarChart data={q25.data.chartData} keys={['avgPerformance', 'avgSatisfaction']} xKey="source" height={300} />
          : null}
      </div>

      {!q25.loading && q25.data?.chartData && (
        <div className="card p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Resignation Rate, Time to Hire & Cost by Source</h3>
          <GroupedBarChart data={q25.data.chartData} keys={['resignationRate', 'avgTimeToHire']} xKey="source" height={260} />
        </div>
      )}

      {!q25.loading && q25.data?.chartData && (
        <div className="card p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Full Comparison Table</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-surface-500">
                  {['Source', 'Count', 'Avg Perf', 'Avg Satisfaction', 'Resignation %', 'Avg Days', 'Avg Cost ($)'].map(h => (
                    <th key={h} className="py-2 px-3 text-left text-slate-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {q25.data.chartData.map((r, i) => (
                  <tr key={i} className="border-t border-surface-500/30 hover:bg-surface-600/30">
                    <td className="py-2 px-3 text-brand-400 font-medium">{r.source}</td>
                    <td className="py-2 px-3 text-slate-400">{r.count}</td>
                    <td className="py-2 px-3 text-white font-bold">{r.avgPerformance}</td>
                    <td className="py-2 px-3 text-emerald-400">{r.avgSatisfaction}</td>
                    <td className="py-2 px-3 text-red-400">{r.resignationRate}%</td>
                    <td className="py-2 px-3 text-slate-300">{r.avgTimeToHire}</td>
                    <td className="py-2 px-3 text-slate-300">{Number(r.avgCost).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
