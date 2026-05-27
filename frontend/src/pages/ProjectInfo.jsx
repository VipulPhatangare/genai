import {
  Database, Brain, BarChart3, Shield, RefreshCw, MessageSquare,
  Upload, ArrowRight, CheckCircle2, Cpu, Layers, Zap, GitBranch,
  ChevronRight, FileText, Server, Globe, Package,
} from 'lucide-react'

function Section({ title, children }) {
  return (
    <div className="card p-6 space-y-4">
      <h2 className="text-white font-bold text-base border-b border-surface-500 pb-3">{title}</h2>
      {children}
    </div>
  )
}

function Badge({ label, color = 'brand' }) {
  const colors = {
    brand:   'bg-brand-500/15 text-brand-300 border-brand-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    blue:    'bg-blue-500/10 text-blue-300 border-blue-500/30',
    purple:  'bg-purple-500/10 text-purple-300 border-purple-500/30',
    red:     'bg-red-500/10 text-red-300 border-red-500/30',
    slate:   'bg-surface-600 text-slate-300 border-surface-400',
  }
  return (
    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${colors[color]}`}>
      {label}
    </span>
  )
}

function FlowStep({ step, icon: Icon, title, desc, isLast }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-brand-400" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-brand-500/20 my-1.5" />}
      </div>
      <div className="pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">Step {step}</span>
        </div>
        <p className="text-white text-sm font-semibold">{title}</p>
        <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function TechCard({ name, version, purpose, color }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-600/50 border border-surface-500/40">
      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
        color === 'brand' ? 'bg-brand-400' :
        color === 'emerald' ? 'bg-emerald-400' :
        color === 'blue' ? 'bg-blue-400' :
        color === 'purple' ? 'bg-purple-400' : 'bg-slate-400'
      }`} />
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

const ANALYSIS_SECTIONS = [
  { label: 'Performance', qs: 'Q1 – Q5', desc: 'Skills, ratings & ideal employee profile', color: 'brand' },
  { label: 'Training & Mentorship', qs: 'Q6 – Q10', desc: 'Dev hours, mentor impact, top programs', color: 'emerald' },
  { label: 'Behavioral Skills', qs: 'Q11 – Q14', desc: 'Engagement clusters, conflict, blockers', color: 'purple' },
  { label: 'Project Performance', qs: 'Q15 – Q18', desc: 'Complexity, outcomes, role success', color: 'blue' },
  { label: 'Attrition & Retention', qs: 'Q19 – Q21', desc: 'Resignation risk, work-life balance', color: 'red' },
  { label: 'Compensation', qs: 'Q22 – Q24', desc: 'Salary trends, bonuses, underpaid list', color: 'emerald' },
  { label: 'Recruitment', qs: 'Q25', desc: 'Source effectiveness, hire cost & time', color: 'brand' },
]

const NL2QUERY_STEPS = [
  {
    icon: FileText,
    title: 'Schema-Aware Prompt',
    desc: 'Gemini receives the full MongoDB schema (50+ fields, types, and allowed values) so it understands what data is available before generating anything.',
  },
  {
    icon: GitBranch,
    title: 'Pipeline Generation',
    desc: 'The LLM converts the user\'s natural language question into a MongoDB aggregation pipeline — a JSON array of stages like $match, $group, $sort, $limit.',
  },
  {
    icon: Shield,
    title: 'Security Validation',
    desc: 'A whitelist validator checks every stage name. Only read stages are allowed ($match, $group, $sort, $limit, $project, $addFields…). $out, $merge and any write ops are blocked. Nested pipelines in $lookup and $facet are checked recursively.',
  },
  {
    icon: Database,
    title: 'Execute on MongoDB',
    desc: 'The validated pipeline runs on the employees collection. Results are capped at 50 rows. If the LLM generates invalid JSON, the error is sent back and it retries up to 3 times.',
  },
  {
    icon: Brain,
    title: 'AI Analysis',
    desc: 'Gemini receives the real query results and writes a plain-text answer (≤200 words, bullet points, real numbers). It also recommends the best chart type for the data.',
  },
  {
    icon: BarChart3,
    title: 'Dynamic Chart',
    desc: 'The frontend receives both the answer and a chart config (type + data). It renders Bar, Grouped-Bar, Horizontal-Bar, Line, or Table — built from real aggregated data.',
  },
]

export default function ProjectInfo() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-8">

      {/* Hero */}
      <div className="card p-6 border-brand-500/20 bg-gradient-to-br from-brand-500/5 to-transparent">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl leading-tight">HR Analytics Intelligence Platform</h1>
            <p className="text-brand-400 text-sm mt-0.5 font-medium">by SynthoMind Innovation</p>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed max-w-2xl">
              A full-stack AI-powered HR analytics system that transforms raw employee CSV data into
              actionable insights — using a NL2Query chatbot, 25 pre-built analytical questions, and
              dynamic chart generation across a modern dark-theme dashboard.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge label="React 18" color="blue" />
              <Badge label="Node.js + Express" color="emerald" />
              <Badge label="MongoDB" color="emerald" />
              <Badge label="Gemini 2.5 Flash" color="brand" />
              <Badge label="Recharts" color="purple" />
              <Badge label="Tailwind CSS" color="slate" />
            </div>
          </div>
        </div>
      </div>

      {/* Architecture */}
      <Section title="System Architecture">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              icon: Globe,
              label: 'Frontend',
              color: 'blue',
              items: ['React 18 + Vite', 'React Router v6', 'Recharts charts', 'Tailwind CSS', 'Axios HTTP client'],
            },
            {
              icon: Server,
              label: 'Backend',
              color: 'emerald',
              items: ['Express REST API', '25 analysis routes', 'NL2Query engine', 'LLM insight service', '24h response cache'],
            },
            {
              icon: Database,
              label: 'Database',
              color: 'brand',
              items: ['MongoDB + Mongoose', 'employees collection', 'analysis_cache (24h TTL)', 'Aggregation pipelines', 'Multi-field indexes'],
            },
          ].map(({ icon: Icon, label, color, items }) => (
            <div key={label} className={`p-4 rounded-xl border ${
              color === 'blue' ? 'bg-blue-500/5 border-blue-500/20' :
              color === 'emerald' ? 'bg-emerald-500/5 border-emerald-500/20' :
              'bg-brand-500/5 border-brand-500/20'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-4 h-4 ${
                  color === 'blue' ? 'text-blue-400' :
                  color === 'emerald' ? 'text-emerald-400' : 'text-brand-400'
                }`} />
                <p className="text-white font-semibold text-sm">{label}</p>
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

        {/* Data flow */}
        <div className="mt-2">
          <p className="text-xs text-slate-600 mb-3 uppercase tracking-wider font-medium">Data Flow</p>
          <div className="flex items-center gap-1 flex-wrap">
            {['CSV Upload', 'MongoDB Ingest', 'Aggregation Query', 'Gemini Analysis', 'Chart + Insight'].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-1">
                <span className="text-xs text-slate-300 bg-surface-600 px-2.5 py-1 rounded-lg border border-surface-500/40">
                  {step}
                </span>
                {i < arr.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* NL2Query Pipeline */}
      <Section title="NL2Query Chatbot — Core Innovation">
        <div className="p-3 rounded-xl bg-brand-500/8 border border-brand-500/20 mb-2">
          <p className="text-slate-300 text-xs leading-relaxed">
            <span className="text-brand-300 font-semibold">Why NL2Query, not RAG/Embeddings?</span>
            {' '}Employee data is structured tabular data — embeddings and cosine similarity are built for
            unstructured text. NL2Query gives <span className="text-white font-medium">exact aggregated answers</span> (e.g., "53.5% resignation rate in Sales")
            by generating and executing real MongoDB queries. Every number comes directly from the database.
          </p>
        </div>
        <div className="mt-4">
          {NL2QUERY_STEPS.map((step, i) => (
            <FlowStep
              key={i}
              step={i + 1}
              icon={step.icon}
              title={step.title}
              desc={step.desc}
              isLast={i === NL2QUERY_STEPS.length - 1}
            />
          ))}
        </div>
      </Section>

      {/* 7 Sections */}
      <Section title="25 Analytical Questions Across 7 Sections">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ANALYSIS_SECTIONS.map(({ label, qs, desc, color }) => (
            <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-surface-600/50 border border-surface-500/40">
              <div className={`mt-0.5 shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                color === 'brand' ? 'bg-brand-500/20 text-brand-400' :
                color === 'emerald' ? 'bg-emerald-500/15 text-emerald-400' :
                color === 'purple' ? 'bg-purple-500/15 text-purple-400' :
                color === 'blue' ? 'bg-blue-500/15 text-blue-400' :
                'bg-red-500/15 text-red-400'
              }`}>
                {qs}
              </div>
              <div>
                <p className="text-white text-xs font-semibold">{label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-2">
          Each question renders a Recharts chart + an AI Insight card (Key Finding · Evidence · Recommendation)
          powered by Gemini 2.5 Flash with 24-hour response caching.
        </p>
      </Section>

      {/* Key Features */}
      <Section title="Key Features & Design Decisions">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              icon: Shield,
              color: 'red',
              title: 'Read-Only Security',
              desc: 'Whitelist validator blocks $out, $merge and all write stages. Nested pipelines inside $lookup and $facet are checked recursively with a max depth of 3.',
            },
            {
              icon: RefreshCw,
              color: 'brand',
              title: '3-Attempt Retry',
              desc: 'If the LLM generates invalid JSON (bad escaping, JS comments, trailing commas), the parse error is fed back to the LLM and it regenerates — up to 3 times.',
            },
            {
              icon: Zap,
              color: 'emerald',
              title: '24-Hour Cache',
              desc: 'All 25 pre-built analysis responses are cached in MongoDB with a TTL index. Re-visiting sections loads in milliseconds without hitting the LLM.',
            },
            {
              icon: MessageSquare,
              color: 'purple',
              title: 'Persistent Chat History',
              desc: 'Chat sessions saved in localStorage with auto-titles from the first message. Survives page refresh. Delete with a confirmation popup.',
            },
            {
              icon: BarChart3,
              color: 'brand',
              title: 'Dynamic Chart Selection',
              desc: 'Gemini picks the best chart type per query: bar, grouped-bar, horizontal-bar, line, or table. Data is passed as structured JSON and rendered by Recharts.',
            },
            {
              icon: Brain,
              color: 'emerald',
              title: '"Why" Questions',
              desc: 'Conceptual "why" questions trigger a comparison pipeline — fetching real metrics for the groups being compared — so the answer is always data-grounded.',
            },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="flex gap-3 p-3 rounded-xl bg-surface-600/50 border border-surface-500/40">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                color === 'red' ? 'bg-red-500/15 border border-red-500/30' :
                color === 'brand' ? 'bg-brand-500/15 border border-brand-500/30' :
                color === 'emerald' ? 'bg-emerald-500/10 border border-emerald-500/30' :
                'bg-purple-500/10 border border-purple-500/30'
              }`}>
                <Icon className={`w-3.5 h-3.5 ${
                  color === 'red' ? 'text-red-400' :
                  color === 'brand' ? 'text-brand-400' :
                  color === 'emerald' ? 'text-emerald-400' : 'text-purple-400'
                }`} />
              </div>
              <div>
                <p className="text-white text-xs font-semibold">{title}</p>
                <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Tech Stack */}
      <Section title="Tech Stack">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-wider font-medium mb-2">Frontend</p>
            <div className="space-y-2">
              <TechCard name="React 18" version="^18.3" purpose="UI component framework" color="blue" />
              <TechCard name="Vite" version="^5.3" purpose="Build tool & dev server (port 3000)" color="blue" />
              <TechCard name="React Router v6" version="^6.23" purpose="Client-side routing & nested layouts" color="blue" />
              <TechCard name="Recharts" version="^2.12" purpose="Bar, Line, Radar, Scatter, Heatmap charts" color="blue" />
              <TechCard name="Tailwind CSS" version="^3.4" purpose="Utility-first dark theme styling" color="blue" />
              <TechCard name="Lucide React" purpose="Icon library" color="blue" />
              <TechCard name="Axios" version="^1.7" purpose="HTTP client with proxy to backend" color="blue" />
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-wider font-medium mb-2">Backend</p>
            <div className="space-y-2">
              <TechCard name="Node.js + Express" version="^4.19" purpose="REST API server (port 5000)" color="emerald" />
              <TechCard name="Mongoose" version="^8.4" purpose="MongoDB ODM with schema + indexes" color="emerald" />
              <TechCard name="Gemini 2.5 Flash" purpose="NL2Query + insight generation (65k token output)" color="brand" />
              <TechCard name="MongoDB" purpose="employees collection + 24h analysis cache" color="emerald" />
              <TechCard name="csvtojson" version="^2.0" purpose="CSV parsing on upload" color="emerald" />
              <TechCard name="Multer" version="^1.4" purpose="Multipart file upload handling" color="emerald" />
              <TechCard name="simple-statistics" version="^7.8" purpose="Statistical calculations" color="emerald" />
            </div>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <div className="text-center py-2">
        <p className="text-xs text-slate-600">Built by <span className="text-slate-400 font-medium">SynthoMind Innovation</span></p>
      </div>

    </div>
  )
}
