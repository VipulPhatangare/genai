import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, TrendingUp, UserMinus, Briefcase, GraduationCap, DollarSign, Brain, MessageSquare, ArrowRight, Upload } from 'lucide-react'
import StatCard from '../components/StatCard'
import { getDataStatus } from '../services/api'

const SECTIONS = [
  { to: '/performance',  label: 'Performance Analytics', sub: 'Skills, ratings, ideal profile',   icon: TrendingUp,    color: 'brand',   qs: 'Q1–Q5' },
  { to: '/training',     label: 'Training & Mentorship', sub: 'Dev hours, mentor impact',         icon: GraduationCap, color: 'emerald', qs: 'Q6–Q10' },
  { to: '/behavioral',   label: 'Behavioral Skills',     sub: 'Clusters, engagement, blockers',   icon: Brain,         color: 'purple',  qs: 'Q11–Q14' },
  { to: '/projects',     label: 'Project Performance',   sub: 'Complexity, outcomes, roles',      icon: Briefcase,     color: 'blue',    qs: 'Q15–Q18' },
  { to: '/attrition',    label: 'Attrition & Retention', sub: 'Resignation risk, work-life',      icon: UserMinus,     color: 'red',     qs: 'Q19–Q21' },
  { to: '/compensation', label: 'Compensation',          sub: 'Salary, bonus, underpaid list',    icon: DollarSign,    color: 'emerald', qs: 'Q22–Q24' },
  { to: '/recruitment',  label: 'Recruitment',           sub: 'Source effectiveness, cost',       icon: Users,         color: 'brand',   qs: 'Q25' },
  { to: '/chat',         label: 'AI Chat (RAG)',         sub: 'Natural language HR queries',      icon: MessageSquare, color: 'purple',  qs: 'Chat' },
]

export default function Dashboard() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDataStatus()
      .then(r => setStatus(r.data))
      .catch(() => setStatus(null))
      .finally(() => setLoading(false))
  }, [])

  if (!loading && (!status || status.total === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Upload className="w-12 h-12 text-slate-600 mb-4" />
        <h2 className="text-white text-xl font-bold">No Data Loaded</h2>
        <p className="text-slate-400 text-sm mt-2 mb-6">Upload your Employee Data CSV to begin analytics</p>
        <Link to="/upload" className="btn-primary flex items-center gap-2">
          <Upload className="w-4 h-4" /> Upload CSV
        </Link>
      </div>
    )
  }

  const topDept = status?.departments?.[0]
  const resignationRate = null // would require full query; shown as N/A here

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Employees"
          value={loading ? '—' : status?.total?.toLocaleString() || '0'}
          sub="Records in database"
          icon={Users}
          color="brand"
        />
        <StatCard
          label="Departments"
          value={loading ? '—' : status?.departments?.length || '0'}
          sub={topDept ? `Largest: ${topDept._id} (${topDept.count})` : ''}
          icon={Briefcase}
          color="blue"
        />
        <StatCard
          label="AI Chat"
          value="NL2Query"
          sub="AI-Powered · MongoDB pipeline"
          icon={Brain}
          color="purple"
        />
        <StatCard
          label="Analysis Sections"
          value="7"
          sub="25 total questions"
          icon={TrendingUp}
          color="emerald"
        />
      </div>

      {/* Department breakdown */}
      {status?.departments?.length > 0 && (
        <div className="card p-5">
          <h3 className="text-white font-semibold mb-3 text-sm">Department Distribution</h3>
          <div className="flex flex-wrap gap-2">
            {status.departments.map(d => (
              <div key={d._id} className="flex items-center gap-2 bg-surface-600 rounded-lg px-3 py-1.5">
                <span className="text-white text-sm font-medium">{d._id}</span>
                <span className="badge-orange">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Navigation Cards */}
      <div>
        <h2 className="text-white font-bold mb-4">Analysis Sections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {SECTIONS.map(({ to, label, sub, icon: Icon, color, qs }) => (
            <Link key={to} to={to} className="card-hover p-5 flex items-start gap-4 group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                color === 'brand' ? 'bg-brand-500/15' :
                color === 'emerald' ? 'bg-emerald-500/15' :
                color === 'red' ? 'bg-red-500/15' :
                color === 'blue' ? 'bg-blue-500/15' :
                'bg-purple-500/15'
              }`}>
                <Icon className={`w-5 h-5 ${
                  color === 'brand' ? 'text-brand-400' :
                  color === 'emerald' ? 'text-emerald-400' :
                  color === 'red' ? 'text-red-400' :
                  color === 'blue' ? 'text-blue-400' :
                  'text-purple-400'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-white font-semibold text-sm">{label}</p>
                  <span className="badge-orange ml-2 shrink-0">{qs}</span>
                </div>
                <p className="text-slate-400 text-xs mt-1">{sub}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-brand-400 transition-colors shrink-0 mt-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
