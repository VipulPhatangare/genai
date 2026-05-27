import { useState } from 'react'
import { ChevronDown, ChevronRight, FlaskConical } from 'lucide-react'

export default function AnalysisApproach({ approach }) {
  const [open, setOpen] = useState(false)
  if (!approach) return null

  return (
    <div className="border border-emerald-500/20 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors text-left"
      >
        {open
          ? <ChevronDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          : <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
        <FlaskConical className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">How we solved this</span>
      </button>
      {open && (
        <div className="px-4 py-3 bg-emerald-500/3 border-t border-emerald-500/15">
          <p className="text-xs text-slate-400 leading-relaxed">{approach}</p>
        </div>
      )}
    </div>
  )
}
