import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatCard({ label, value, sub, trend, icon: Icon, color = 'brand' }) {
  const colorMap = {
    brand:   { bg: 'bg-brand-500/10',   text: 'text-brand-400',   border: 'border-brand-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    red:     { bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/20' },
    blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/20' },
    purple:  { bg: 'bg-purple-500/10',  text: 'text-purple-400',  border: 'border-purple-500/20' },
  }
  const c = colorMap[color] || colorMap.brand

  return (
    <div className={`card p-4 flex items-start gap-3 border ${c.border}`}>
      {Icon && (
        <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4.5 h-4.5 ${c.text}`} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-slate-400 text-xs">{label}</p>
        <p className="text-white text-xl font-bold mt-0.5 leading-none">{value}</p>
        {sub && (
          <div className="flex items-center gap-1 mt-1">
            {trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
            {trend === 'flat' && <Minus className="w-3 h-3 text-slate-500" />}
            <p className={`text-xs ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-500'}`}>
              {sub}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
