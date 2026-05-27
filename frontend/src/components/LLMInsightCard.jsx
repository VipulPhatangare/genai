import { useState } from 'react'
import { Sparkles, Loader2, ChevronDown, ChevronRight } from 'lucide-react'

function parseInsight(text) {
  if (!text) return { reasoning: [], finding: '', evidence: [], recommendation: '' }

  const reasoningMatch   = text.match(/\*\*REASONING:\*\*\s*([\s\S]+?)(?=\*\*KEY FINDING|\*\*$|$)/i)
  const findingMatch     = text.match(/\*\*KEY FINDING:\*\*\s*(.+?)(?=\n|\*\*|$)/s)
  const evidenceMatch    = text.match(/\*\*EVIDENCE:\*\*\s*([\s\S]+?)(?=\*\*RECOMMENDATION|\*\*$|$)/)
  const recMatch         = text.match(/\*\*RECOMMENDATION:\*\*\s*([\s\S]+?)$/)

  const reasoning = reasoningMatch
    ? reasoningMatch[1]
        .split('\n')
        .map(l => l.replace(/^[•\-*]\s*/, '').trim())
        .filter(l => l.length > 0)
    : []

  const evidence = evidenceMatch
    ? evidenceMatch[1]
        .split('\n')
        .map(l => l.replace(/^[•\-*]\s*/, '').trim())
        .filter(l => l.length > 0)
    : []

  return {
    reasoning,
    finding: findingMatch ? findingMatch[1].trim() : '',
    evidence,
    recommendation: recMatch ? recMatch[1].trim() : '',
  }
}

export default function LLMInsightCard({ insight, loading }) {
  const parsed = parseInsight(insight)
  const [reasoningOpen, setReasoningOpen] = useState(false)

  return (
    <div className="card h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-500">
        <div className="w-6 h-6 rounded-md bg-brand-500/20 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
        </div>
        <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
          Insights
        </span>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-surface-500" />
              <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-slate-500 text-xs">AI is analyzing…</p>
          </div>
        ) : insight ? (
          <div className="space-y-4 animate-fade-in">

            {/* Reasoning — collapsible */}
            {parsed.reasoning.length > 0 && (
              <div>
                <button
                  onClick={() => setReasoningOpen(o => !o)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1.5 hover:text-purple-300 transition-colors"
                >
                  {reasoningOpen
                    ? <ChevronDown className="w-3.5 h-3.5" />
                    : <ChevronRight className="w-3.5 h-3.5" />}
                  Reasoning
                </button>
                {reasoningOpen && (
                  <ul className="space-y-1.5 pl-1">
                    {parsed.reasoning.map((item, i) => (
                      <li key={i} className="flex gap-2 text-xs text-slate-400">
                        <span className="text-purple-500 mt-0.5 shrink-0">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {parsed.finding && (
              <div>
                <p className="text-xs font-semibold text-brand-500 uppercase tracking-wider mb-1.5">
                  Key Finding
                </p>
                <p className="text-white text-sm font-medium leading-relaxed">
                  {parsed.finding}
                </p>
              </div>
            )}

            {parsed.evidence.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Evidence
                </p>
                <ul className="space-y-1.5">
                  {parsed.evidence.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-300">
                      <span className="text-brand-500 mt-0.5 shrink-0">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {parsed.recommendation && (
              <div className="bg-brand-500/8 border border-brand-500/20 rounded-lg p-3">
                <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1.5">
                  Recommendation
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {parsed.recommendation}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <Sparkles className="w-8 h-8 text-surface-400 mb-2" />
            <p className="text-slate-600 text-sm">AI insight will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}
