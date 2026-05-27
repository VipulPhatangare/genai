import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, Cell,
} from 'recharts'

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1a1c25', border: '1px solid #2a2d42', borderRadius: 8, color: '#e2e8f0', fontSize: 12 },
  labelStyle: { color: '#e2e8f0', fontWeight: 600 },
  itemStyle: { color: '#f97316' },
}

const ORANGE_PALETTE = ['#f97316', '#fb923c', '#fdba74', '#ea580c', '#c2410c', '#fed7aa', '#7c2d12', '#ff6b2b']

// --- Grouped Bar Chart ---
export function GroupedBarChart({ data, keys, height = 300, xKey = 'name' }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey={xKey} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip {...TOOLTIP_STYLE} />
        <Legend />
        {keys.map((key, i) => (
          <Bar key={key} dataKey={key} fill={ORANGE_PALETTE[i % ORANGE_PALETTE.length]} radius={[3, 3, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

// --- Single Bar Chart ---
export function SingleBarChart({ data, dataKey, xKey = 'name', height = 300, color = '#f97316' }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey={xKey} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false}
          angle={-35} textAnchor="end" interval={0} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip {...TOOLTIP_STYLE} />
        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={ORANGE_PALETTE[i % ORANGE_PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// --- Horizontal Bar Chart ---
export function HorizontalBarChart({ data, dataKey, xKey = 'feature', height = 320, label }) {
  const barLabel = label || dataKey
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          domain={[0, 'auto']}
          tickCount={6}
          tickFormatter={v => Number.isInteger(v) ? v : v.toFixed(1)}
        />
        <YAxis
          type="category"
          dataKey={xKey}
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={130}
        />
        <Tooltip
          {...TOOLTIP_STYLE}
          formatter={v => [typeof v === 'number' ? (Number.isInteger(v) ? v : v.toFixed(2)) : v, barLabel]}
        />
        <Bar dataKey={dataKey} name={barLabel} radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={ORANGE_PALETTE[i % ORANGE_PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// --- Radar Chart ---
export function RadarChartComp({ data, keys, height = 300 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 9 }} />
        {keys.map((key, i) => (
          <Radar key={key} name={key} dataKey={key}
            stroke={ORANGE_PALETTE[i]} fill={ORANGE_PALETTE[i]} fillOpacity={0.15} strokeWidth={2} />
        ))}
        <Legend />
        <Tooltip {...TOOLTIP_STYLE} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

// --- Scatter Chart ---
export function ScatterPlot({ data, xLabel = 'X', yLabel = 'Y', height = 280, colorKey }) {
  const resigned = data.filter(d => d.resigned || d.highlighted)
  const normal = data.filter(d => !d.resigned && !d.highlighted)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="x" name={xLabel} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: xLabel, fill: '#64748b', fontSize: 11, position: 'insideBottom', offset: -4 }} />
        <YAxis dataKey="y" name={yLabel} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ stroke: '#f97316', strokeWidth: 1 }} {...TOOLTIP_STYLE} />
        <Scatter data={normal} fill="#3a3d5c" opacity={0.6} />
        {resigned.length > 0 && <Scatter data={resigned} fill="#f97316" opacity={0.8} />}
      </ScatterChart>
    </ResponsiveContainer>
  )
}

// --- Heatmap (table-based) ---
export function Heatmap({ data }) {
  const complexities = [...new Set(data.map(d => d.complexity))]
  const sizes = [...new Set(data.map(d => d.size))]
  const max = Math.max(...data.map(d => d.successRate))

  function cellColor(rate) {
    const intensity = rate / 100
    if (intensity > 0.7) return `rgba(249,115,22,${0.4 + intensity * 0.5})`
    if (intensity > 0.4) return `rgba(249,115,22,${0.15 + intensity * 0.4})`
    return `rgba(239,68,68,${0.15 + (1 - intensity) * 0.3})`
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-2 px-3 text-slate-500 font-medium text-xs">Complexity / Size</th>
            {sizes.map(s => (
              <th key={s} className="py-2 px-4 text-center text-slate-400 font-medium text-xs">{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {complexities.map(c => (
            <tr key={c}>
              <td className="py-2 px-3 text-slate-400 font-medium text-xs">{c}</td>
              {sizes.map(s => {
                const cell = data.find(d => d.complexity === c && d.size === s)
                return (
                  <td key={s} className="py-2 px-4 text-center rounded-lg">
                    <div
                      className="mx-auto w-16 py-2 rounded-lg text-sm font-bold"
                      style={{ background: cellColor(cell?.successRate || 0), color: '#fff' }}
                    >
                      {cell?.successRate ?? 0}%
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// --- Line Chart ---
export function LineChartComp({ data, keys, xKey = 'name', height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey={xKey} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip {...TOOLTIP_STYLE} />
        <Legend />
        {keys.map((key, i) => (
          <Line key={key} type="monotone" dataKey={key}
            stroke={ORANGE_PALETTE[i]} strokeWidth={2} dot={{ r: 3, fill: ORANGE_PALETTE[i] }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
