import { useState, useEffect } from 'react'
import { getQ15, getQ16, getQ17, getQ18 } from '../services/api'
import { GroupedBarChart, HorizontalBarChart } from '../components/charts/index'
import { Heatmap } from '../components/charts/index'
import AnalysisApproach from '../components/AnalysisApproach'

const TABS = [
  { id: 'q15', label: 'Complexity × Size Heatmap',  sub: 'Q15', question: 'How do Project Complexity and Project Size together influence the probability of a successful project outcome?', columns: ['Project_Complexity', 'Project_Size', 'Project_Outcome'], approach: 'Built a 3×3 cross-tabulation of Project_Complexity (Low/Medium/High) × Project_Size (Small/Medium/Large). Each cell holds the success-rate percentage for that combination. The heatmap colour-codes cells from red (high failure) to green (high success), immediately surfacing the riskiest project configurations.' },
  { id: 'q16', label: 'Success vs Failure Patterns', sub: 'Q16', question: 'What patterns in skills, training and behavior distinguish employees in successful vs failed projects?', columns: ['Project_Outcome', 'Technical_Skills_Rating', 'Training_Program'], approach: 'Grouped employees by Project_Outcome (Successful vs Failed). Computed the mean of six skill ratings for each group to reveal where the capability gap lives. Additionally compared training program distribution across both groups. Overlaid bar charts make the skill and training patterns between successful and failed employees immediately comparable.' },
  { id: 'q17', label: 'Feature Importance',           sub: 'Q17', question: 'What combination of skills and ratings best predicts a successful project outcome?', columns: ['Project_Outcome', 'all skill ratings', 'Project_Complexity'], approach: 'Computed Pearson |r| (absolute correlation) between each numeric feature and Project_Outcome (binary: 1=Success, 0=Failure). Ranked all features by correlation strength. The horizontal bar chart shows which individual inputs most predict project success — effectively a lightweight feature-importance analysis without requiring a trained ML model.' },
  { id: 'q18', label: 'Performance by Role',          sub: 'Q18', question: 'How does performance rating distribution compare across Manager, Developer and Analyst project roles?', columns: ['Project_Role', 'Performance_Rating', 'Department'], approach: 'Grouped employees by Project_Role. Computed full distribution statistics for Performance_Rating per role: min, Q1, median, Q3, max, and mean. Box-plot-style grouped bars visualise spread and central tendency, while the summary table adds resignation rate per role — connecting performance distribution to attrition risk.' },
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

export default function Section4() {
  const [tab, setTab] = useState('q15')
  const q15 = useAnalysis(getQ15)
  const q16 = useAnalysis(getQ16)
  const q17 = useAnalysis(getQ17)
  const q18 = useAnalysis(getQ18)
  const analyses = { q15, q16, q17, q18 }

  useEffect(() => { analyses[tab].load() }, [tab])
  const current = analyses[tab]

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${tab === t.id ? 'tab-active' : 'tab-inactive'}`}>
            {t.label} <span className="opacity-50 ml-1">{t.sub}</span>
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

      {/* Q15 — Heatmap */}
      {tab === 'q15' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-white font-semibold text-sm mb-5">Project Success Rate — Complexity × Size</h3>
            {current.loading ? <div className="h-48 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
              : current.data ? <Heatmap data={current.data.heatmapData} />
              : null}
          </div>
          {!current.loading && current.data?.barData && (
            <div className="card p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Success Rate by Complexity (grouped by Size)</h3>
              <GroupedBarChart data={current.data.barData} keys={['Small', 'Medium', 'Large']} xKey="complexity" height={260} />
            </div>
          )}
        </div>
      )}

      {/* Q16 */}
      {tab === 'q16' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Skill Profile — Successful vs Failed Projects</h3>
            {current.loading ? <div className="h-64 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
              : current.data ? <GroupedBarChart data={current.data.chartData} keys={['Successful', 'Failed']} xKey="skill" height={300} />
              : null}
          </div>
          {!current.loading && current.data?.trainingComparison && (
            <div className="card p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Training Distribution — Successful vs Failed</h3>
              <GroupedBarChart data={current.data.trainingComparison} keys={['Successful', 'Failed']} xKey="name" height={220} />
            </div>
          )}
        </div>
      )}

      {/* Q17 — Feature Importance */}
      {tab === 'q17' && (
        <div className="card p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Feature Importance for Project Success (Pearson |r|)</h3>
          {current.loading ? <div className="h-72 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
            : current.data ? <HorizontalBarChart data={current.data.chartData} dataKey="correlation" xKey="feature" height={340} />
            : null}
        </div>
      )}

      {/* Q18 — By Role */}
      {tab === 'q18' && (
        <div className="card p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Performance Rating Distribution by Project Role</h3>
          {current.loading ? <div className="h-64 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
            : current.data ? (
              <>
                <GroupedBarChart
                  data={current.data.chartData}
                  keys={['min', 'q1', 'median', 'q3', 'max', 'mean']}
                  xKey="role"
                  height={300}
                />
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-surface-500">
                        {['Role', 'Count', 'Median', 'Mean', 'Min', 'Max', 'Resignation %'].map(h => (
                          <th key={h} className="py-2 px-3 text-slate-500 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {current.data.chartData.map(r => (
                        <tr key={r.role} className="border-b border-surface-500/40 hover:bg-surface-600/30">
                          <td className="py-2 px-3 text-white font-medium">{r.role}</td>
                          <td className="py-2 px-3 text-slate-300">{r.count}</td>
                          <td className="py-2 px-3 text-brand-400 font-medium">{r.median}</td>
                          <td className="py-2 px-3 text-slate-300">{r.mean}</td>
                          <td className="py-2 px-3 text-slate-400">{r.min}</td>
                          <td className="py-2 px-3 text-slate-400">{r.max}</td>
                          <td className="py-2 px-3 text-red-400">{r.resignationRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}
        </div>
      )}
    </div>
  )
}
