import { useState } from 'react'
import {
  Database, Brain, BarChart3, Shield, RefreshCw, MessageSquare,
  ArrowRight, FileText, Server, Globe, Package, Zap, GitBranch,
  ChevronRight, ChevronDown, Layers, Lock, AlertTriangle,
  Users, TrendingUp, GraduationCap, Briefcase, UserMinus,
  DollarSign, FlaskConical, Code2, Cpu, Clock, CheckCircle2,
  Github, Copy, Check,
} from 'lucide-react'

const GITHUB_URL = 'https://github.com/VipulPhatangare/genai'

function GitHubCard() {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(GITHUB_URL).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div className="card p-4 border-brand-500/20 bg-brand-500/3 flex items-center gap-4 flex-wrap">
      <div className="w-9 h-9 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center shrink-0">
        <Github className="w-4.5 h-4.5 text-brand-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs font-semibold">Source Code — GitHub Repository</p>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-400 text-xs font-mono hover:underline truncate block mt-0.5"
        >
          {GITHUB_URL}
        </a>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            copied
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-surface-600 text-slate-300 border border-surface-500/40 hover:bg-surface-500/40'
          }`}
        >
          {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
        </button>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-500/15 text-brand-400 border border-brand-500/30 hover:bg-brand-500/25 transition-colors"
        >
          <Github className="w-3 h-3" /> Open
        </a>
      </div>
    </div>
  )
}

/* ─── Primitive UI helpers ─────────────────────────────────────── */

function Badge({ label, color = 'brand' }) {
  const c = {
    brand:   'bg-brand-500/15 text-brand-300 border-brand-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    blue:    'bg-blue-500/10 text-blue-300 border-blue-500/30',
    purple:  'bg-purple-500/10 text-purple-300 border-purple-500/30',
    red:     'bg-red-500/10 text-red-300 border-red-500/30',
    amber:   'bg-amber-500/10 text-amber-300 border-amber-500/30',
    slate:   'bg-surface-600 text-slate-300 border-surface-400',
  }
  return (
    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${c[color]}`}>
      {label}
    </span>
  )
}

function SectionCard({ title, icon: Icon, iconColor = 'text-brand-400', children }) {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-2.5 border-b border-surface-500 pb-3">
        {Icon && <Icon className={`w-4 h-4 ${iconColor} shrink-0`} />}
        <h2 className="text-white font-bold text-sm tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Collapsible({ title, icon: Icon, iconColor = 'text-brand-400', badge, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-surface-500/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-4 py-3 bg-surface-600/30 hover:bg-surface-600/60 transition-colors text-left"
      >
        {Icon && <Icon className={`w-3.5 h-3.5 ${iconColor} shrink-0`} />}
        <span className="text-sm font-semibold text-white flex-1">{title}</span>
        {badge && <Badge label={badge} color="slate" />}
        {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 py-4 border-t border-surface-500/40 space-y-3">
          {children}
        </div>
      )}
    </div>
  )
}

function FlowStep({ step, icon: Icon, title, desc, sub, isLast }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-brand-400" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-brand-500/20 my-1.5" />}
      </div>
      <div className="pb-5 min-w-0">
        <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">Step {step}</span>
        <p className="text-white text-sm font-semibold mt-0.5">{title}</p>
        <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
        {sub && (
          <div className="mt-1.5 px-2.5 py-1.5 rounded-lg bg-surface-700 border border-surface-500/40">
            <p className="text-xs text-slate-500 font-mono leading-relaxed">{sub}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function TechCard({ name, version, purpose, color }) {
  const dot = { brand: 'bg-brand-400', emerald: 'bg-emerald-400', blue: 'bg-blue-400', purple: 'bg-purple-400', slate: 'bg-slate-400' }
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-600/50 border border-surface-500/40">
      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dot[color] || dot.slate}`} />
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-white text-xs font-semibold">{name}</p>
          {version && <span className="text-[10px] text-slate-600">{version}</span>}
        </div>
        <p className="text-slate-500 text-xs mt-0.5">{purpose}</p>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-surface-500/30 last:border-0">
      <span className="text-slate-500 text-xs w-40 shrink-0">{label}</span>
      <span className="text-slate-300 text-xs leading-relaxed">{value}</span>
    </div>
  )
}

/* ─── Data ─────────────────────────────────────────────────────── */

const ALL_QUESTIONS = [
  {
    section: 'Performance', color: 'brand', icon: TrendingUp,
    qs: [
      { id: 'Q1', label: 'Weighted Scoring', q: 'How do Technical, Communication & Problem-Solving skills collectively influence Performance Rating?', method: 'Pearson correlation', approach: 'Computed Pearson r for each skill vs Performance_Rating. Normalised to % weights. Bar chart shows relative influence.' },
      { id: 'Q2', label: 'High Perf / Low Leadership', q: 'Which employees show high performance but low leadership potential?', method: 'Filter + group', approach: 'Filter: Performance > 8 AND Leadership < 5. Grouped by Department. Avg Mentor_Rating checked as causal proxy. AI reasons over multi-factor summary.', hasLLM: true },
      { id: 'Q3', label: 'High vs Low Patterns', q: 'What behavioral patterns separate high performers (≥10) from low performers (≤5)?', method: 'Cohort comparison', approach: 'Split into High (≥10) / Low (≤5) cohorts. Computed mean of 4 skill dimensions per cohort. Grouped bar overlay shows gap.' },
      { id: 'Q4', label: 'Skill-Outcome Gap', q: 'Where do high skill ratings not align with actual project outcomes?', method: 'Anomaly filter', approach: 'Filter: avg_skill > 7 AND Project_Outcome = Failed. Grouped by complexity. Overtime averaged as burnout proxy. AI explains the paradox.', hasLLM: true },
      { id: 'Q5', label: 'Ideal Employee Profile', q: 'What defines an ideal employee based on the top 10% performers?', method: 'Percentile + radar', approach: 'Top 10% by Performance_Rating. Mean of all skill/engagement columns vs full workforce. Radar chart overlays both profiles.' },
    ]
  },
  {
    section: 'Training & Mentorship', color: 'emerald', icon: GraduationCap,
    qs: [
      { id: 'Q6', label: 'Dev Hours vs Performance', q: 'Do Professional Development Hours correlate with Performance Rating and Promotions?', method: 'Pearson r × 2', approach: 'Pearson r: Dev Hours ↔ Performance and Dev Hours ↔ Promotions. Grouped by Training_Program for side-by-side comparison.' },
      { id: 'Q7', label: 'Mentor Impact', q: 'How does Mentor Rating and Experience Level affect internship conversion and performance?', method: 'Group by + dual axis', approach: 'Group by Mentor_Experience_Level and Mentor_Rating bucket. Avg Performance + Conversion_Rate per group. AI reasons across both axes.', hasLLM: true },
      { id: 'Q8', label: 'Trained but Low Perf', q: 'Which employees received training but still show low performance?', method: 'Compound filter', approach: 'Filter: Training_Program ≠ None AND Performance ≤ 5. Grouped by Department. % with no mentor + high overtime computed as root-cause proxies.', hasLLM: true },
      { id: 'Q9', label: 'Basic vs Advanced', q: 'How do Basic vs Advanced training programs differ in performance and career growth?', method: 'Group aggregate', approach: 'Group by Training_Program. Mean Performance_Rating and Number_Of_Promotions per program. Side-by-side bars reveal program effectiveness.' },
      { id: 'Q10', label: 'Training Candidates', q: 'Which employees are most likely to benefit from advanced training?', method: 'Mid-performer filter', approach: 'Identify Performance 6–9 (mid-band). Group by Department. AI cross-references engagement scores to prioritise upskilling candidates.', hasLLM: true },
    ]
  },
  {
    section: 'Behavioral Skills', color: 'purple', icon: Brain,
    qs: [
      { id: 'Q11', label: 'Soft Skill Clusters', q: 'How do employees cluster on Leadership, Teamwork, Adaptability & Creativity?', method: 'KMeans (k=4)', approach: 'KMeans clustering on 4 soft-skill dimensions. Cluster centers reveal archetypes. Cluster size + dominant department computed. AI labels each archetype.', hasLLM: true },
      { id: 'Q12', label: 'Conflict vs Teamwork', q: 'Why do some employees have high conflict cases but low teamwork scores?', method: 'Quadrant filter', approach: 'Filter: Conflict > 2 AND Teamwork < 5. Scatter highlights quadrant. Group by Job_Role. AI explains the contradiction.', hasLLM: true },
      { id: 'Q13', label: 'Engagement Impact', q: 'How does Engagement Score impact Job Satisfaction and Retention?', method: 'Pearson r + bucket', approach: 'Pearson r: Engagement ↔ Satisfaction. Bucketed into Low/Medium/High tiers. Resignation rate + avg satisfaction per tier. Scatter shows continuous relationship.' },
      { id: 'Q14', label: 'Initiative vs Innovation', q: 'Why do high-initiative employees show low innovation contribution?', method: 'Anomaly + root cause', approach: 'Filter: Initiative > 7 AND Innovation_Projects_Involvement = 0. % overtime > 10h (bandwidth) + % junior roles (access) as measurable blockers.', hasLLM: true },
    ]
  },
  {
    section: 'Project Performance', color: 'blue', icon: Briefcase,
    qs: [
      { id: 'Q15', label: 'Complexity × Size Heatmap', q: 'How do Project Complexity and Size jointly influence success probability?', method: 'Cross-tabulation', approach: '3×3 cross-tab: Complexity (Low/Med/High) × Size (Small/Med/Large). Each cell = success rate %. Heatmap from red (high failure) to green (high success).' },
      { id: 'Q16', label: 'Success vs Failure Patterns', q: 'What patterns in skills and training distinguish successful from failed projects?', method: 'Cohort comparison', approach: 'Group by Project_Outcome. Mean of 6 skill ratings per group. Training program distribution compared. Overlaid bars reveal skill and training gaps.' },
      { id: 'Q17', label: 'Feature Importance', q: 'What combination of skills best predicts a successful project outcome?', method: 'Pearson |r| ranking', approach: 'Pearson |r| between each feature and Project_Outcome (binary). All features ranked by correlation strength. Horizontal bar = lightweight feature importance.' },
      { id: 'Q18', label: 'Performance by Role', q: 'How does performance distribution compare across Manager, Developer, Analyst?', method: 'Distribution stats', approach: 'Group by Project_Role. Min, Q1, median, Q3, max, mean of Performance_Rating per role. Resignation rate per role adds attrition dimension.' },
    ]
  },
  {
    section: 'Attrition & Retention', color: 'red', icon: UserMinus,
    qs: [
      { id: 'Q19', label: 'Resignation Factors', q: 'What factors most strongly contribute to Employee Resignation?', method: 'Mean-diff ranking', approach: 'Mean of every numeric column for Resigned vs Retained separately. Ranked by absolute difference. Top 10 shown. AI applies multi-factor causality reasoning.', hasLLM: true },
      { id: 'Q20', label: 'Risk Profile', q: 'Which behavioral and compensation features define an at-risk employee profile?', method: 'Profile comparison', approach: 'At-risk = already resigned employees. Extracted mean of all features. Compared vs full workforce. AI identifies the resign-risk signature for proactive HR.', hasLLM: true },
      { id: 'Q21', label: 'Work-Life Balance', q: 'How do work-life balance, overtime and engagement differ between resigned and retained?', method: 'Group comparison', approach: 'Group by Resignation_Status. Compare 3 wellness metrics: WLB_Rating, Overtime_Hours, Engagement_Score. Identifies whether overwork or disengagement drives attrition.' },
    ]
  },
  {
    section: 'Compensation', color: 'emerald', icon: DollarSign,
    qs: [
      { id: 'Q22', label: 'Salary & Bonus vs Performance', q: 'How do Salary Increase % and Bonus % relate to Performance across groups?', method: 'Pearson r + tiering', approach: 'Pearson r: Salary ↔ Performance and Bonus ↔ Performance. Performance tiered into Low/Med/High. Avg compensation per tier. Scatter shows linearity.' },
      { id: 'Q23', label: 'Underpaid Employees', q: 'Which high-performing employees are underpaid relative to their output?', method: 'Percentile threshold', approach: 'Underpaid = Performance > P75 AND Salary_Increase < P25. Dual percentile quadrant. Department breakdown + resignation cross-reference quantifies business cost.' },
      { id: 'Q24', label: 'Benefits vs Retention', q: 'Do compensation benefits influence employee retention and satisfaction?', method: 'Benefit tier grouping', approach: 'Group by Stock_Options × Health_Insurance tier combinations. Resignation_Rate + Avg_Satisfaction per tier. Table + chart isolate benefit impact from performance.' },
    ]
  },
  {
    section: 'Recruitment', color: 'brand', icon: Users,
    qs: [
      { id: 'Q25', label: 'Hiring Source Effectiveness', q: 'How do Hiring Source, Time-to-Hire and Recruitment Cost impact performance and retention?', method: 'Multi-metric grouping', approach: 'Group by Hiring_Source. Compute avg Performance, Satisfaction, Resignation_Rate, Time_to_Hire (days), Recruitment_Cost. Three-chart layout separates quality, efficiency, and cost metrics.' },
    ]
  },
]

const API_ENDPOINTS = [
  { method: 'POST', path: '/api/data/upload', desc: 'Upload employee CSV — parses and bulk-inserts into MongoDB' },
  { method: 'GET',  path: '/api/data/status', desc: 'Returns total record count + departments list' },
  { method: 'POST', path: '/api/rag/query',   desc: 'NL2Query: natural language → pipeline → AI answer + chart config' },
  { method: 'GET',  path: '/api/analysis/q1', desc: 'Skill correlation weights for Performance Rating' },
  { method: 'GET',  path: '/api/analysis/q2', desc: 'High-perf / Low-leadership employees by department + LLM insight' },
  { method: 'GET',  path: '/api/analysis/q3', desc: 'High vs low performer skill profile comparison' },
  { method: 'GET',  path: '/api/analysis/q4', desc: 'Skill-outcome gap detection + LLM insight' },
  { method: 'GET',  path: '/api/analysis/q5', desc: 'Ideal employee radar (top 10% vs all)' },
  { method: 'GET',  path: '/api/analysis/q6–q25', desc: '20 additional analysis endpoints following same pattern' },
  { method: 'POST', path: '/api/admin/clear-cache', desc: 'Purge MongoDB analysis cache (admin use)' },
]

const STAT_METHODS = [
  { name: 'Pearson Correlation (r)', where: 'Q1, Q6, Q13, Q22', desc: 'Measures linear association between two numeric variables. r = 1 (perfect positive), r = −1 (perfect negative), r = 0 (no linear relation). Used to rank skill influence and compensation linkage.' },
  { name: 'KMeans Clustering', where: 'Q11', desc: 'Unsupervised algorithm that partitions employees into k=4 groups by minimising intra-cluster distance on 4 soft-skill dimensions. Cluster centers reveal behavioural archetypes.' },
  { name: 'Cross-Tabulation (Contingency Table)', where: 'Q15', desc: '3×3 matrix of Complexity × Size. Each cell holds success_count / total_count = success_rate %. Rendered as a heatmap.' },
  { name: 'Percentile Thresholds (P25, P75)', where: 'Q23', desc: 'P75 of Performance_Rating and P25 of Salary_Increase_Pct identify the underpaid-high-performer quadrant without assuming a fixed threshold.' },
  { name: 'Absolute Mean Difference', where: 'Q19, Q20', desc: 'For each numeric column, |mean(Resigned) − mean(Retained)| is computed. Columns ranked by this score — a fast, model-free feature importance proxy.' },
  { name: 'Distribution Statistics', where: 'Q18', desc: 'Min, Q1, median, Q3, max, and mean of Performance_Rating per project role. Equivalent to a box-plot in tabular form.' },
  { name: 'Cohort Comparison', where: 'Q3, Q16', desc: 'Split employees by a categorical cut-point (performance group or project outcome). Compute column means per cohort and overlay for direct comparison.' },
]

/* ─── Page ──────────────────────────────────────────────────────── */

export default function ProjectInfo() {
  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">

      {/* ── Hero ── */}
      <div className="card p-6 border-brand-500/20 bg-gradient-to-br from-brand-500/5 to-transparent">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center shrink-0">
            <BarChart3 className="w-7 h-7 text-brand-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-white font-bold text-xl leading-tight">HR Analytics Intelligence Platform</h1>
            <p className="text-brand-400 text-sm mt-0.5 font-medium">by SynthoMind Innovation</p>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed max-w-3xl">
              A full-stack AI-powered HR analytics system that transforms raw employee CSV data into
              actionable insights — using a NL2Query chatbot, 25 pre-built analytical questions across
              7 domains, 7 chart types, and structured LLM reasoning visible at every layer.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge label="React 18 + Vite" color="blue" />
              <Badge label="Node.js + Express" color="emerald" />
              <Badge label="MongoDB" color="emerald" />
              <Badge label="Gemini 2.5 Flash" color="brand" />
              <Badge label="Recharts" color="purple" />
              <Badge label="NL2Query" color="amber" />
              <Badge label="Tailwind CSS" color="slate" />
            </div>
          </div>
        </div>

        {/* quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            { value: '25', label: 'Analysis Questions', color: 'text-brand-400' },
            { value: '7', label: 'Chart Types', color: 'text-purple-400' },
            { value: '50+', label: 'Dataset Columns', color: 'text-emerald-400' },
            { value: '24h', label: 'Response Cache TTL', color: 'text-blue-400' },
          ].map(({ value, label, color }) => (
            <div key={label} className="bg-surface-600/40 border border-surface-500/40 rounded-xl p-3 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── GitHub Link ── */}
      <GitHubCard />

      {/* ── User Workflow ── */}
      <SectionCard title="End-to-End User Workflow" icon={Users} iconColor="text-emerald-400">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { n: '1', icon: FileText, title: 'Upload CSV', desc: 'Drag-drop or browse a CSV file. Backend parses each row, cleans nulls, derives computed fields, and bulk-inserts into MongoDB employees collection.' },
            { n: '2', icon: BarChart3, title: 'Explore Dashboard', desc: 'Overview dashboard shows total employees, departments, and key stat cards. Navigate to any of 7 analytical sections using the sidebar.' },
            { n: '3', icon: Brain, title: 'Read AI Insights', desc: 'Each of the 25 tabs loads a pre-computed chart + an LLM insight card with structured REASONING → KEY FINDING → EVIDENCE → RECOMMENDATION.' },
            { n: '4', icon: MessageSquare, title: 'Ask Anything', desc: 'Type any HR question in the AI Chat. The NL2Query engine generates a live MongoDB pipeline, executes it, and the AI answers with a chart and reasoning.' },
          ].map(({ n, icon: Icon, title, desc }) => (
            <div key={n} className="p-4 rounded-xl bg-surface-600/30 border border-surface-500/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs font-bold flex items-center justify-center shrink-0">{n}</span>
                <Icon className="w-4 h-4 text-brand-400" />
                <p className="text-white text-xs font-semibold">{title}</p>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── System Architecture ── */}
      <SectionCard title="System Architecture" icon={Layers} iconColor="text-blue-400">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              icon: Globe, label: 'Frontend (Port 3000)', color: 'blue',
              items: [
                'React 18 + Vite build tool',
                'React Router v6 — 9 routes',
                'Recharts — 7 chart components',
                'Tailwind CSS dark theme',
                'Axios with /api proxy',
                'localStorage chat sessions',
              ],
            },
            {
              icon: Server, label: 'Backend (Port 5000)', color: 'emerald',
              items: [
                'Express REST API',
                '25 analysis route handlers',
                'NL2Query engine (rag.js)',
                'LLM insight service (llm.js)',
                'Multer CSV upload handler',
                'simple-statistics library',
              ],
            },
            {
              icon: Database, label: 'MongoDB', color: 'brand',
              items: [
                'employees collection (50+ fields)',
                'analysis_cache (24h TTL index)',
                'Aggregation pipeline execution',
                'Bulk insert on upload',
                '$match, $group, $sort, $project',
                'Multi-field compound indexes',
              ],
            },
          ].map(({ icon: Icon, label, color, items }) => (
            <div key={label} className={`p-4 rounded-xl border ${
              color === 'blue' ? 'bg-blue-500/5 border-blue-500/20' :
              color === 'emerald' ? 'bg-emerald-500/5 border-emerald-500/20' :
              'bg-brand-500/5 border-brand-500/20'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-4 h-4 ${color === 'blue' ? 'text-blue-400' : color === 'emerald' ? 'text-emerald-400' : 'text-brand-400'}`} />
                <p className="text-white font-semibold text-xs">{label}</p>
              </div>
              <ul className="space-y-1.5">
                {items.map(item => (
                  <li key={item} className="flex items-center gap-2 text-xs text-slate-400">
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* full data flow */}
        <div className="mt-2 p-3 rounded-xl bg-surface-600/20 border border-surface-500/30">
          <p className="text-xs text-slate-600 mb-2 uppercase tracking-wider font-medium">Complete Data Flow</p>
          <div className="flex items-center gap-1 flex-wrap">
            {[
              'CSV File', 'Multer Upload', 'csvtojson Parse', 'MongoDB Bulk Insert',
              'Mongoose Schema', 'Aggregation Pipeline', 'simple-statistics',
              'Gemini 2.5 Flash', '24h Cache', 'REST Response', 'Recharts Chart',
            ].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-1">
                <span className="text-xs text-slate-300 bg-surface-600 px-2.5 py-1 rounded-lg border border-surface-500/40">{step}</span>
                {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* routing table */}
        <div className="mt-1">
          <p className="text-xs text-slate-600 mb-2 uppercase tracking-wider font-medium">Frontend Routes</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {[
              ['/dashboard', 'Overview stats + quick nav'],
              ['/performance', 'Q1–Q5: Skills & ratings'],
              ['/training', 'Q6–Q10: Training & mentorship'],
              ['/behavioral', 'Q11–Q14: Soft skills & engagement'],
              ['/projects', 'Q15–Q18: Project outcomes'],
              ['/attrition', 'Q19–Q21: Resignation analysis'],
              ['/compensation', 'Q22–Q24: Salary & benefits'],
              ['/recruitment', 'Q25: Hiring source effectiveness'],
              ['/chat', 'NL2Query AI chatbot'],
              ['/project', 'This documentation page'],
            ].map(([path, desc]) => (
              <div key={path} className="flex gap-2 text-xs px-2 py-1.5 rounded bg-surface-600/30 border border-surface-500/30">
                <span className="text-brand-400 font-mono shrink-0">{path}</span>
                <span className="text-slate-500">—</span>
                <span className="text-slate-400">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ── NL2Query Pipeline ── */}
      <SectionCard title="NL2Query Chatbot — Core Innovation" icon={Brain} iconColor="text-brand-400">
        <div className="p-3 rounded-xl bg-brand-500/8 border border-brand-500/20">
          <p className="text-slate-300 text-xs leading-relaxed">
            <span className="text-brand-300 font-semibold">Why NL2Query instead of RAG + Embeddings?</span>
            {' '}Employee data is structured tabular data — embeddings and cosine similarity are optimised for
            unstructured text. NL2Query generates and executes real MongoDB aggregation pipelines, producing
            <span className="text-white font-medium"> exact aggregated answers</span> (e.g. "53.5% resignation rate in Sales") directly from the database.
            Every number in the response is mathematically derived, never hallucinated.
          </p>
        </div>

        <div className="mt-2">
          {[
            {
              icon: FileText,
              title: 'Schema-Aware System Prompt',
              desc: 'Gemini receives the full MongoDB schema — 50+ field names, data types, and allowed values (e.g. Training_Program ∈ {Basic, Advanced, None}). This eliminates hallucinated field names.',
              sub: 'SCHEMA: { Employee_ID: String, Performance_Rating: Number(1-15), Department: ["Engineering","Sales",...], ... }',
            },
            {
              icon: GitBranch,
              title: 'Aggregation Pipeline Generation',
              desc: 'The LLM outputs a JSON array of MongoDB aggregation stages — $match, $group, $sort, $limit, $project, $addFields — matching the question semantics.',
              sub: '[{"$match":{"Employee_Resignation_Status":"Yes"}}, {"$group":{"_id":"$Department","count":{"$sum":1}}}, {"$sort":{"count":-1}}]',
            },
            {
              icon: Shield,
              title: 'Whitelist Security Validation',
              desc: 'Every stage name is checked against an ALLOWED_STAGES whitelist. $out, $merge, $insert, and any write operations are blocked. $lookup and $facet sub-pipelines are validated recursively (max depth 3).',
              sub: 'ALLOWED: $match $group $sort $limit $project $addFields $unwind $lookup $facet $bucket $count\nBLOCKED: $out $merge $indexStats $currentOp',
            },
            {
              icon: RefreshCw,
              title: '3-Attempt Retry Loop',
              desc: 'If the LLM generates invalid JSON (JS comments, trailing commas, bad escaping), the parse error is injected back into the prompt: "Your previous pipeline caused: SyntaxError…". The LLM self-corrects and retries.',
              sub: 'Attempt 1 → JSON.parse error → feed error back → Attempt 2 → valid → execute',
            },
            {
              icon: Database,
              title: 'Execute on MongoDB (capped at 50 rows)',
              desc: 'The validated pipeline is executed against the employees collection via Mongoose. Results are capped at 50 documents. The pipeline and record count are both returned to the frontend.',
            },
            {
              icon: Brain,
              title: 'AI Analysis with REASONING',
              desc: 'Gemini receives the real query results and responds in a strict 3-part format: REASONING (multi-factor causality), ANSWER (≤200 words with real numbers), VISUALIZATION (chart config JSON).',
              sub: 'REASONING: ...\nANSWER: ...\nVISUALIZATION: {"type":"bar","data":[...],"xKey":"...","dataKey":"..."}',
            },
            {
              icon: BarChart3,
              title: 'Dynamic Chart Rendering',
              desc: 'The frontend parses the VISUALIZATION block and renders Bar, Grouped-Bar, Horizontal-Bar, Line, or Table from real aggregated data. Chart type is chosen by the AI based on the data shape.',
              isLast: true,
            },
          ].map((step, i, arr) => (
            <FlowStep key={i} step={i + 1} {...step} isLast={i === arr.length - 1} />
          ))}
        </div>
      </SectionCard>

      {/* ── AI Prompting Strategy ── */}
      <SectionCard title="AI Prompting Strategy" icon={Cpu} iconColor="text-purple-400">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="text-xs text-slate-600 uppercase tracking-wider font-medium">Chat (NL2Query) Prompts</p>
            {[
              { label: 'Model', value: 'gemini-2.5-flash — 65k output tokens' },
              { label: 'Temperature', value: '0.2 (low = deterministic pipeline JSON)' },
              { label: 'System role', value: 'MongoDB expert who only generates aggregation pipelines — never answers in prose at generation step' },
              { label: 'Retry injection', value: 'Parse error + previous bad output fed back as user turn for self-correction' },
              { label: 'Output format', value: 'REASONING: ... \\nANSWER: ... \\nVISUALIZATION: {...}' },
              { label: 'Small-talk path', value: 'Detected via keyword heuristic — skips pipeline generation, goes straight to conversational reply' },
            ].map(({ label, value }) => <InfoRow key={label} label={label} value={value} />)}
          </div>
          <div className="space-y-3">
            <p className="text-xs text-slate-600 uppercase tracking-wider font-medium">Pre-built Insight Prompts (Q2, Q4, Q7…)</p>
            {[
              { label: 'Model', value: 'gemini-2.5-flash' },
              { label: 'Temperature', value: '0.3 (slightly creative for recommendations)' },
              { label: 'Max output tokens', value: '2048' },
              { label: 'Input', value: 'Computed statistical summary JSON — never raw employee data' },
              { label: 'Output format', value: '**REASONING:** • ... \\n**KEY FINDING:** ... \\n**EVIDENCE:** • ... \\n**RECOMMENDATION:** ...' },
              { label: 'REASONING rule', value: 'Must compare ≥2 variables, explain causality or correlation, flag small samples (n < 10)' },
              { label: 'Cache', value: '24h MongoDB TTL — same question never re-calls the API' },
            ].map(({ label, value }) => <InfoRow key={label} label={label} value={value} />)}
          </div>
        </div>

        <div className="mt-2 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
          <p className="text-xs text-purple-300 font-semibold mb-1">Why structured output format?</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Free-form LLM prose is hard to parse and display meaningfully. By enforcing a strict markdown section format,
            the frontend can render REASONING as a collapsible panel (so judges can see the AI\'s thought process),
            KEY FINDING as a prominent headline, EVIDENCE as a bullet list, and RECOMMENDATION in a highlighted box —
            each styled differently to guide the reader\'s attention.
          </p>
        </div>
      </SectionCard>

      {/* ── Security Model ── */}
      <SectionCard title="Security Model" icon={Shield} iconColor="text-red-400">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              color: 'red', icon: Lock,
              title: 'Pipeline Whitelist Validation',
              desc: 'Only read-only aggregation stages are permitted. The validator recursively checks nested pipelines inside $lookup and $facet sub-stages. Any unknown or write stage causes the pipeline to be rejected immediately.',
            },
            {
              color: 'amber', icon: AlertTriangle,
              title: 'No Raw Data Exposure',
              desc: 'The AI only ever receives computed statistical summaries — averages, counts, rates. Raw employee records (names, IDs, salaries) are never sent to Gemini, protecting individual privacy.',
            },
            {
              color: 'emerald', icon: CheckCircle2,
              title: 'Result Capping',
              desc: 'All pipeline executions are capped at 50 result rows via a forced $limit stage. This prevents the LLM from accidentally triggering full-collection scans and exhausting response payload limits.',
            },
            {
              color: 'blue', icon: Code2,
              title: 'JSON-Only Pipeline Output',
              desc: 'The pipeline generation prompt explicitly forbids JavaScript syntax, comments, and template literals. Only pure JSON arrays are accepted. Any non-JSON output triggers the retry loop.',
            },
          ].map(({ color, icon: Icon, title, desc }) => (
            <div key={title} className={`flex gap-3 p-3 rounded-xl border ${
              color === 'red' ? 'bg-red-500/5 border-red-500/20' :
              color === 'amber' ? 'bg-amber-500/5 border-amber-500/20' :
              color === 'emerald' ? 'bg-emerald-500/5 border-emerald-500/20' :
              'bg-blue-500/5 border-blue-500/20'
            }`}>
              <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${
                color === 'red' ? 'text-red-400' : color === 'amber' ? 'text-amber-400' :
                color === 'emerald' ? 'text-emerald-400' : 'text-blue-400'
              }`} />
              <div>
                <p className="text-white text-xs font-semibold">{title}</p>
                <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── All 25 Questions ── */}
      <SectionCard title="All 25 Analytical Questions — Full Approach" icon={FlaskConical} iconColor="text-emerald-400">
        <p className="text-xs text-slate-500">Click any section to expand questions and see the exact statistical method and implementation approach used.</p>
        <div className="space-y-2 mt-1">
          {ALL_QUESTIONS.map(({ section, color, icon: SIcon, qs }) => (
            <Collapsible
              key={section}
              title={section}
              icon={SIcon}
              iconColor={`text-${color === 'brand' ? 'brand' : color === 'emerald' ? 'emerald' : color === 'purple' ? 'purple' : color === 'blue' ? 'blue' : color === 'red' ? 'red' : 'brand'}-400`}
              badge={`${qs.length} question${qs.length > 1 ? 's' : ''}`}
            >
              <div className="space-y-3">
                {qs.map(({ id, label, q, method, approach, hasLLM }) => (
                  <div key={id} className="p-3 rounded-xl bg-surface-700/50 border border-surface-500/30">
                    <div className="flex items-start gap-2 mb-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        color === 'brand' ? 'bg-brand-500/20 text-brand-400' :
                        color === 'emerald' ? 'bg-emerald-500/15 text-emerald-400' :
                        color === 'purple' ? 'bg-purple-500/15 text-purple-400' :
                        color === 'blue' ? 'bg-blue-500/15 text-blue-400' :
                        'bg-red-500/15 text-red-400'
                      }`}>{id}</span>
                      <p className="text-white text-xs font-semibold">{label}</p>
                      {hasLLM && <span className="ml-auto text-brand-500 text-xs shrink-0">✦ AI</span>}
                    </div>
                    <p className="text-slate-400 text-xs italic mb-2">"{q}"</p>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[10px] text-slate-600 uppercase tracking-wider">Method:</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">{method}</span>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">{approach}</p>
                  </div>
                ))}
              </div>
            </Collapsible>
          ))}
        </div>
      </SectionCard>

      {/* ── Statistical Methods ── */}
      <SectionCard title="Statistical Methods Used" icon={BarChart3} iconColor="text-blue-400">
        <div className="space-y-2">
          {STAT_METHODS.map(({ name, where, desc }) => (
            <div key={name} className="p-3 rounded-xl bg-surface-600/40 border border-surface-500/40">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <p className="text-white text-xs font-semibold">{name}</p>
                <span className="text-[10px] text-slate-500 bg-surface-700 px-2 py-0.5 rounded font-mono">{where}</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Data Methodology ── */}
      <SectionCard title="Data Methodology & Assumptions" icon={Database} iconColor="text-emerald-400">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="text-xs text-slate-600 uppercase tracking-wider font-medium">Data Cleaning Rules (Upload Pipeline)</p>
            {[
              { field: 'Null / N/A / empty strings', rule: 'Converted to null via toNum(). MongoDB $avg automatically excludes null — no skewing.' },
              { field: 'Numeric fields', rule: 'Parsed with Number() — invalid strings → null (not 0) to avoid corrupting averages.' },
              { field: 'String fields', rule: 'Trimmed and normalised. Empty strings stored as null.' },
              { field: 'Date fields', rule: 'Hire_Date, Onboarding_Date → new Date(). Invalid dates → null.' },
              { field: 'Boolean-like strings', rule: '"Yes"/"No" stored as-is. $match uses string equality — no cast needed.' },
            ].map(({ field, rule }) => (
              <div key={field} className="p-2.5 rounded-lg bg-surface-600/50 border border-surface-500/40">
                <p className="text-white text-xs font-semibold">{field}</p>
                <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{rule}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-xs text-slate-600 uppercase tracking-wider font-medium">Derived Fields & Scale Definitions</p>
            {[
              { field: 'performance_group', rule: 'Runtime-derived via $addFields in aggregation: ≤5 → "Low", 6–9 → "Mid", ≥10 → "High". Not stored on disk.' },
              { field: 'Performance_Rating', rule: '1–15 scale. Higher = better. All performance comparisons use this field.' },
              { field: '8 Skill Rating fields', rule: '1–10 scale: Technical, Communication, Problem-Solving, Teamwork, Leadership, Initiative, Adaptability, Creativity.' },
              { field: 'Engagement / Satisfaction / WLB', rule: '1–10 scale. Employee_Engagement_Score, Job_Satisfaction_Score, Work_Life_Balance_Rating.' },
              { field: 'avg_skill_score', rule: 'Runtime average of all 8 skill fields per employee, computed inside aggregation pipelines for Q4.' },
              { field: 'Resignation_Status', rule: '"Yes" = resigned, "No" = retained. String-based binary for $match filtering.' },
            ].map(({ field, rule }) => (
              <div key={field} className="p-2.5 rounded-lg bg-surface-600/50 border border-surface-500/40">
                <p className="text-white text-xs font-semibold">{field}</p>
                <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{rule}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 mt-2">
          <p className="text-xs text-amber-300 font-semibold mb-1.5">Known Limitations</p>
          <ul className="space-y-1">
            {[
              'Snapshot data only — dataset has no timestamps, so time-series trend analysis is not possible.',
              'Correlation ≠ causation — all "why" answers are data-supported hypotheses, not causal proofs.',
              'Small groups (n < 10) are flagged with an amber caution badge in the chatbot to prevent overinterpretation.',
              'Aggregation pipelines cap at 50 rows — tail distributions or rare values may not be fully visible.',
              'KMeans (Q11) requires a fixed k=4 — the optimal k was chosen heuristically for the dataset size.',
              'NL2Query accuracy degrades on highly ambiguous questions — a 3-attempt retry partially mitigates this.',
            ].map(l => (
              <li key={l} className="flex gap-2 text-xs text-amber-400/80">
                <span className="shrink-0 mt-0.5">•</span><span>{l}</span>
              </li>
            ))}
          </ul>
        </div>
      </SectionCard>

      {/* ── Caching Architecture ── */}
      <SectionCard title="Caching Architecture" icon={Zap} iconColor="text-amber-400">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-wider font-medium mb-2">How it works</p>
            <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
              <p>Every pre-built analysis endpoint (Q1–Q25) caches the LLM insight response in the <span className="text-white font-mono">analysis_cache</span> MongoDB collection.</p>
              <p>Cache key = a deterministic string per question (e.g. <span className="font-mono text-brand-400">"q2-insight"</span>). On first request, the LLM is called and the result stored. Subsequent requests serve from cache in &lt; 5ms.</p>
              <p>TTL = 24 hours, enforced by a MongoDB TTL index on the <span className="font-mono text-white">createdAt</span> field. Expired entries are auto-deleted by MongoDB.</p>
              <p>Race condition on simultaneous first requests is handled by a try/catch around <span className="font-mono text-white">AnalysisCache.create()</span> — duplicate key errors are silently ignored.</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-wider font-medium mb-2">Cache Schema</p>
            <div className="bg-surface-700 rounded-xl p-3 font-mono text-xs text-slate-300 space-y-1">
              <p className="text-slate-500">// models/AnalysisCache.js</p>
              <p><span className="text-purple-400">key</span>: String (unique index)</p>
              <p><span className="text-purple-400">result</span>: String (LLM response text)</p>
              <p><span className="text-purple-400">createdAt</span>: Date (TTL = 86400s)</p>
            </div>
            <div className="mt-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-xs text-emerald-300 font-semibold mb-1">Design rationale</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Without caching, every page visit for a pre-built question would fire a Gemini API call (latency 3–8s, cost per token). Caching makes the analytics platform feel instant after the first load, with zero additional API cost.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── API Endpoints ── */}
      <SectionCard title="API Endpoint Reference" icon={Code2} iconColor="text-slate-400">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-surface-500">
                {['Method', 'Endpoint', 'Description'].map(h => (
                  <th key={h} className="py-2 px-3 text-left text-slate-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {API_ENDPOINTS.map(({ method, path, desc }) => (
                <tr key={path} className="border-b border-surface-500/30 hover:bg-surface-600/20">
                  <td className="py-2 px-3">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      method === 'GET' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400'
                    }`}>{method}</span>
                  </td>
                  <td className="py-2 px-3 font-mono text-brand-400">{path}</td>
                  <td className="py-2 px-3 text-slate-400">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Key Design Decisions ── */}
      <SectionCard title="Key Design Decisions & Rationale" icon={GitBranch} iconColor="text-brand-400">
        <div className="space-y-2">
          {[
            {
              decision: 'NL2Query over traditional RAG',
              rationale: 'Employee data is structured — every answer is a number or category. Vector similarity search is designed for unstructured text retrieval. NL2Query gives exact aggregated answers (e.g. "mean salary 12.3%") with no retrieval noise.',
            },
            {
              decision: 'Structured LLM output format (REASONING / ANSWER / VISUALIZATION)',
              rationale: 'Free-form prose cannot be parsed into UI components. The strict format lets the frontend render reasoning as a collapsible panel, the answer as prose, and the chart config as live Recharts data — each with distinct visual treatment.',
            },
            {
              decision: 'MongoDB aggregation pipelines (not ORM queries)',
              rationale: 'MongoDB aggregation pipelines run server-side, are declarative JSON, and can be LLM-generated and validated. An ORM (Mongoose query builder) cannot be safely generated by an LLM — aggregation pipelines can.',
            },
            {
              decision: 'localStorage for chat history (not database)',
              rationale: 'No authentication or user model is needed. localStorage survives page refresh, supports session rename/delete, and keeps the architecture simple for a single-tenant demo deployment.',
            },
            {
              decision: '24h MongoDB TTL cache for LLM insights',
              rationale: 'Pre-built analysis answers do not change between sessions unless new data is uploaded. Caching eliminates repeated API calls, reduces latency from ~6s to <5ms, and avoids per-token costs on every page load.',
            },
            {
              decision: 'Statistical summaries sent to AI, not raw data',
              rationale: 'Sending 5000 raw employee rows to Gemini would exhaust the context window and expose PII. Sending a 20-row computed summary (means, counts, rates) keeps the prompt small, fast, and privacy-safe.',
            },
          ].map(({ decision, rationale }) => (
            <div key={decision} className="p-3 rounded-xl bg-surface-600/40 border border-surface-500/40">
              <p className="text-white text-xs font-semibold mb-1">↳ {decision}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{rationale}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Tech Stack ── */}
      <SectionCard title="Full Tech Stack" icon={Package} iconColor="text-slate-400">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-wider font-medium mb-2">Frontend</p>
            <div className="space-y-2">
              <TechCard name="React 18" version="^18.3" purpose="UI component framework with hooks" color="blue" />
              <TechCard name="Vite" version="^5.3" purpose="Build tool & HMR dev server (port 3000)" color="blue" />
              <TechCard name="React Router v6" version="^6.23" purpose="Client-side routing & nested layouts" color="blue" />
              <TechCard name="Recharts" version="^2.12" purpose="Bar, Grouped-Bar, Radar, Scatter, Heatmap, Line" color="blue" />
              <TechCard name="Tailwind CSS" version="^3.4" purpose="Utility-first dark theme (custom design tokens)" color="blue" />
              <TechCard name="Lucide React" purpose="Icon set (consistent stroke-width icons)" color="blue" />
              <TechCard name="Axios" version="^1.7" purpose="HTTP client with /api proxy to backend" color="blue" />
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-wider font-medium mb-2">Backend</p>
            <div className="space-y-2">
              <TechCard name="Node.js + Express" version="^4.19" purpose="REST API server on port 5000" color="emerald" />
              <TechCard name="Mongoose" version="^8.4" purpose="MongoDB ODM — schema, validation, indexes" color="emerald" />
              <TechCard name="@google/generative-ai" purpose="Gemini 2.5 Flash — NL2Query + insights" color="brand" />
              <TechCard name="MongoDB" purpose="employees + analysis_cache collections" color="emerald" />
              <TechCard name="csvtojson" version="^2.0" purpose="CSV stream parsing on upload" color="emerald" />
              <TechCard name="Multer" version="^1.4" purpose="Multipart/form-data file upload middleware" color="emerald" />
              <TechCard name="simple-statistics" version="^7.8" purpose="Pearson r, mean, median, percentiles" color="emerald" />
              <TechCard name="dotenv" purpose="Environment variable management" color="slate" />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* footer */}
      <div className="text-center py-2">
        <p className="text-xs text-slate-600">
          Built by <span className="text-slate-400 font-medium">SynthoMind Innovation</span>
          {' '}· Full-stack AI HR Analytics · Gemini 2.5 Flash · MongoDB NL2Query
        </p>
      </div>

    </div>
  )
}
