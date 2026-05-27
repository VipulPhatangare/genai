import { SingleBarChart, GroupedBarChart, HorizontalBarChart, LineChartComp } from './charts/index'

export default function ChatVisualization({ viz }) {
  if (!viz || !viz.type || viz.type === 'none') return null
  if (!viz.data || viz.data.length === 0) return null

  const hBarHeight = Math.max(180, viz.data.length * 34)

  return (
    <div className="mt-2 card p-4 rounded-xl border border-surface-500/40 bg-surface-700/40">
      {viz.title && (
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          {viz.title}
        </p>
      )}

      {viz.type === 'bar' && viz.xKey && viz.dataKey && (
        <SingleBarChart
          data={viz.data}
          dataKey={viz.dataKey}
          xKey={viz.xKey}
          height={220}
        />
      )}

      {viz.type === 'grouped-bar' && viz.xKey && viz.keys?.length > 0 && (
        <GroupedBarChart
          data={viz.data}
          keys={viz.keys}
          xKey={viz.xKey}
          height={220}
        />
      )}

      {viz.type === 'horizontal-bar' && viz.xKey && viz.dataKey && (
        <HorizontalBarChart
          data={viz.data}
          dataKey={viz.dataKey}
          xKey={viz.xKey}
          height={hBarHeight}
          label={viz.title}
        />
      )}

      {viz.type === 'line' && viz.xKey && viz.keys?.length > 0 && (
        <LineChartComp
          data={viz.data}
          keys={viz.keys}
          xKey={viz.xKey}
          height={220}
        />
      )}

      {viz.type === 'table' && viz.columns?.length > 0 && (
        <div className="overflow-x-auto max-h-64 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-surface-700">
              <tr className="border-b border-surface-500">
                {viz.columns.map(col => (
                  <th key={col.key} className="py-2 px-3 text-left text-slate-500 font-medium whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {viz.data.map((row, i) => (
                <tr key={i} className="border-t border-surface-500/30 hover:bg-surface-600/30">
                  {viz.columns.map(col => (
                    <td key={col.key} className="py-1.5 px-3 text-slate-300 whitespace-nowrap">
                      {row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
