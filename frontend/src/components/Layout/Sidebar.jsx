import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, TrendingUp, GraduationCap, Brain,
  Briefcase, UserMinus, DollarSign, Users, MessageSquare,
  BarChart3, Info,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard',        sub: 'Overview' },
  { to: '/performance',  icon: TrendingUp,      label: 'Performance',      sub: 'Q1 – Q5' },
  { to: '/training',     icon: GraduationCap,   label: 'Training',         sub: 'Q6 – Q10' },
  { to: '/behavioral',   icon: Brain,           label: 'Behavioral',       sub: 'Q11 – Q14' },
  { to: '/projects',     icon: Briefcase,       label: 'Projects',         sub: 'Q15 – Q18' },
  { to: '/attrition',    icon: UserMinus,       label: 'Attrition',        sub: 'Q19 – Q21' },
  { to: '/compensation', icon: DollarSign,      label: 'Compensation',     sub: 'Q22 – Q24' },
  { to: '/recruitment',  icon: Users,           label: 'Recruitment',      sub: 'Q25' },
  { to: '/chat',         icon: MessageSquare,   label: 'AI Chat',          sub: 'RAG Query' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#111218] border-r border-surface-500 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-surface-500">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-brand">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">HR Analytics</p>
            <p className="text-brand-400 text-xs mt-0.5">Intelligence Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label, sub }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                isActive
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-surface-600 border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'}`}
                />
                <div className="min-w-0">
                  <p className={`text-sm font-medium leading-none ${isActive ? 'text-brand-300' : ''}`}>
                    {label}
                  </p>
                  <p className={`text-xs mt-0.5 ${isActive ? 'text-brand-500' : 'text-slate-600 group-hover:text-slate-500'}`}>
                    {sub}
                  </p>
                </div>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Project Info link — pinned above footer */}
      <div className="px-3 pb-3">
        <NavLink
          to="/project"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
              isActive
                ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                : 'text-slate-400 hover:text-white hover:bg-surface-600 border border-transparent'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Info className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <div className="min-w-0">
                <p className={`text-sm font-medium leading-none ${isActive ? 'text-brand-300' : ''}`}>
                  Project Info
                </p>
                <p className={`text-xs mt-0.5 ${isActive ? 'text-brand-500' : 'text-slate-600 group-hover:text-slate-500'}`}>
                  Architecture & Flow
                </p>
              </div>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />}
            </>
          )}
        </NavLink>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-surface-500">
        <p className="text-xs text-slate-600">Powered by</p>
        <p className="text-xs text-slate-500 font-medium">SynthoMind Innovation</p>
      </div>
    </aside>
  )
}
