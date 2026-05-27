import { useState, useEffect } from 'react'
import { getQ22, getQ23, getQ24 } from '../services/api'
import { GroupedBarChart, ScatterPlot, LineChartComp } from '../components/charts/index'
import AnalysisApproach from '../components/AnalysisApproach'

const TABS = [
  { id: 'q22', label: 'Salary & Bonus vs Performance', sub: 'Q22', question: 'How do Salary Increase % and Bonus % relate to Performance Rating across employee groups?', columns: ['Annual_Salary_Increase_Percentage', 'Performance_Bonus_Percentage', 'Performance_Rating'], approach: 'Computed Pearson r between Annual_Salary_Increase_Percentage and Performance_Rating, and separately between Performance_Bonus_Percentage and Performance_Rating. Grouped employees into performance tiers (Low/Medium/High) and compared their average compensation in each tier. Scatter plots reveal whether the correlation is linear or step-based, and whether high performers are consistently rewarded.' },
  { id: 'q23', label: 'Underpaid Employees',            sub: 'Q23', question: 'Which high-performing employees are underpaid relative to their performance and skill levels?', columns: ['Performance_Rating', 'Annual_Salary_Increase_Percentage', 'Department'], approach: 'Defined "underpaid" using a dual threshold: Performance_Rating above the 75th percentile AND Annual_Salary_Increase_Percentage below the 25th percentile. This quadrant identifies employees delivering top results with below-market compensation. Grouped by Department and cross-referenced with Resignation_Status to quantify the business cost — how many have already left.' },
  { id: 'q24', label: 'Benefits vs Retention',          sub: 'Q24', question: 'Do compensation benefits (stock options, insurance, etc.) influence employee retention and satisfaction?', columns: ['Employee_Stock_Options', 'Employee_Health_Insurance_Coverage', 'Employee_Resignation_Status'], approach: 'Grouped employees by combinations of benefit coverage tiers (Stock Options level × Health Insurance level). For each tier combination, computed Resignation_Rate and average Job_Satisfaction_Score. The chart and table reveal whether richer benefit packages statistically correlate with lower attrition — distinguishing benefit impact from performance effects.' },
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

export default function Section6() {
  const [tab, setTab] = useState('q22')
  const q22 = useAnalysis(getQ22)
  const q23 = useAnalysis(getQ23)
  const q24 = useAnalysis(getQ24)
  const analyses = { q22, q23, q24 }

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

      {/* Q22 */}
      {tab === 'q22' && (
        <div className="space-y-4">
          {current.data?.correlations && (
            <div className="grid grid-cols-2 gap-4">
              {[['Salary Increase ↔ Performance', current.data.correlations.salaryVsPerformance],
                ['Bonus % ↔ Performance', current.data.correlations.bonusVsPerformance]].map(([label, val]) => (
                <div key={label} className="card p-4 text-center border-brand-500/20">
                  <p className="text-brand-400 text-2xl font-bold">{val}</p>
                  <p className="text-slate-400 text-xs mt-1">Pearson r — {label}</p>
                </div>
              ))}
            </div>
          )}
          <div className="card p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Average Salary & Bonus % by Performance Group</h3>
            {current.loading ? <div className="h-52 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
              : current.data ? <GroupedBarChart data={current.data.chartData} keys={['Avg Salary Increase %', 'Avg Bonus %']} xKey="group" height={260} />
              : null}
          </div>
          {!current.loading && current.data?.scatterSalary && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="card p-5">
                <h3 className="text-white font-semibold text-sm mb-3">Performance vs Salary Increase</h3>
                <ScatterPlot data={current.data.scatterSalary} xLabel="Performance Rating" yLabel="Salary Increase %" height={220} />
              </div>
              <div className="card p-5">
                <h3 className="text-white font-semibold text-sm mb-3">Performance vs Bonus %</h3>
                <ScatterPlot data={current.data.scatterBonus} xLabel="Performance Rating" yLabel="Bonus %" height={220} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Q23 — Underpaid */}
      {tab === 'q23' && (
        <div className="space-y-4">
          {current.data?.stats && (
            <div className="grid grid-cols-3 gap-4">
              <div className="card p-4 text-center border-red-500/20">
                <p className="text-red-400 text-2xl font-bold">{current.data.stats.totalUnderpaid}</p>
                <p className="text-slate-400 text-xs mt-1">Underpaid High-Performers</p>
              </div>
              <div className="card p-4 text-center border-brand-500/20">
                <p className="text-brand-400 text-2xl font-bold">{current.data.stats.pctResigned}%</p>
                <p className="text-slate-400 text-xs mt-1">Already Resigned</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-white text-sm font-semibold">{current.data.stats.perfThreshold}+</p>
                <p className="text-slate-400 text-xs mt-1">Performance threshold</p>
                <p className="text-white text-sm font-semibold mt-1">≤{current.data.stats.salaryThreshold}%</p>
                <p className="text-slate-400 text-xs">Salary increase threshold</p>
              </div>
            </div>
          )}
          <div className="card p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Underpaid High-Performers by Department</h3>
            {current.loading ? <div className="h-48 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
              : current.data ? (
                <>
                  <GroupedBarChart data={current.data.chartData} keys={['count']} xKey="name" height={220} />
                  <div className="mt-4">
                    <h4 className="text-white font-semibold text-xs mb-2">Employee List (top 50)</h4>
                    <div className="overflow-x-auto max-h-60 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-surface-700">
                          <tr>
                            {['ID', 'Dept', 'Role', 'Perf', 'Salary%', 'Resigned'].map(h => (
                              <th key={h} className="py-2 px-2 text-left text-slate-500 font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {current.data.underpaid?.map((e, i) => (
                            <tr key={i} className="border-t border-surface-500/30 hover:bg-surface-600/30">
                              <td className="py-1.5 px-2 text-slate-400 font-mono text-xs">{e.id}</td>
                              <td className="py-1.5 px-2 text-slate-300">{e.department}</td>
                              <td className="py-1.5 px-2 text-slate-300">{e.role}</td>
                              <td className="py-1.5 px-2 text-brand-400 font-bold">{e.performance}</td>
                              <td className="py-1.5 px-2 text-red-400">{e.salaryIncrease}%</td>
                              <td className="py-1.5 px-2">
                                <span className={e.resigned === 'Yes' ? 'badge-red' : 'badge-green'}>{e.resigned}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : null}
          </div>
        </div>
      )}

      {/* Q24 */}
      {tab === 'q24' && (
        <div className="card p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Benefits vs Resignation Rate & Satisfaction</h3>
          {current.loading ? <div className="h-64 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
            : current.data ? (
              <>
                <GroupedBarChart data={current.data.chartData} keys={['resignationRate', 'avgSatisfaction']} xKey="tier" height={300} />
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-surface-500">
                        {['Benefit', 'Tier', 'Count', 'Resignation Rate', 'Avg Satisfaction'].map(h => (
                          <th key={h} className="py-2 px-3 text-left text-slate-500 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {current.data.chartData?.map((r, i) => (
                        <tr key={i} className="border-t border-surface-500/30 hover:bg-surface-600/30">
                          <td className="py-2 px-3 text-brand-400 font-medium">{r.benefit}</td>
                          <td className="py-2 px-3 text-slate-300">{r.tier}</td>
                          <td className="py-2 px-3 text-slate-400">{r.count}</td>
                          <td className="py-2 px-3 text-red-400">{r.resignationRate}%</td>
                          <td className="py-2 px-3 text-emerald-400">{r.avgSatisfaction}</td>
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
