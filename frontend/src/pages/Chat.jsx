import { useState, useRef, useEffect } from 'react'
import { sendChatMessage } from '../services/api'
import {
  Send, Sparkles, User, Bot, Loader2, Plus, Trash2,
  MessageSquare, Clock, ChevronDown, ChevronRight,
  Database, Brain, AlertTriangle,
} from 'lucide-react'
import ChatVisualization from '../components/ChatVisualization'

// ── localStorage helpers ──
const SESSIONS_KEY = 'hr_chat_sessions'

function loadSessions() {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]') }
  catch { return [] }
}

function saveSessions(sessions) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

const WELCOME_MSG = {
  role: 'assistant',
  content: "Hello! I'm your HR data analyst. Ask me anything about your employee data — I'll search through the records and give you specific, data-grounded answers.",
}

function createSession() {
  return {
    id: Date.now().toString(),
    title: 'New Chat',
    messages: [WELCOME_MSG],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

function renderMarkdown(text) {
  return text.split('\n').map((line, i) => {
    if (/^[•\-\*]\s/.test(line)) {
      const content = line.replace(/^[•\-\*]\s*/, '')
      return (
        <div key={i} className="flex gap-2 mt-1">
          <span className="text-brand-400 shrink-0 mt-0.5">•</span>
          <span>{applyInline(content)}</span>
        </div>
      )
    }
    if (/^\d+\.\s/.test(line)) {
      const [num, ...rest] = line.split(/\.\s/)
      return (
        <div key={i} className="flex gap-2 mt-1">
          <span className="text-brand-400 shrink-0 font-medium">{num}.</span>
          <span>{applyInline(rest.join('. '))}</span>
        </div>
      )
    }
    if (line.trim() === '') return <div key={i} className="h-2" />
    return <div key={i} className="mt-1">{applyInline(line)}</div>
  })
}

function applyInline(text) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((p, i) =>
    i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{p}</strong> : p
  )
}

function formatDate(ts) {
  const d = new Date(ts)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function getSessionTitle(msgs) {
  const firstUser = msgs.find(m => m.role === 'user')
  if (!firstUser) return 'New Chat'
  return firstUser.content.length > 45
    ? firstUser.content.slice(0, 42) + '...'
    : firstUser.content
}

// ── Collapsible panel ──
function CollapsiblePanel({ icon: Icon, label, color = 'brand', children }) {
  const [open, setOpen] = useState(false)
  const colorMap = {
    brand:   { btn: 'text-brand-400 hover:bg-brand-500/10',   icon: 'text-brand-400' },
    purple:  { btn: 'text-purple-400 hover:bg-purple-500/10', icon: 'text-purple-400' },
    emerald: { btn: 'text-emerald-400 hover:bg-emerald-500/10', icon: 'text-emerald-400' },
  }
  const c = colorMap[color] || colorMap.brand
  return (
    <div className="mt-1.5">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-lg transition-all ${c.btn}`}
      >
        <Icon className={`w-3 h-3 ${c.icon}`} />
        <span>{label}</span>
        {open
          ? <ChevronDown className="w-3 h-3 opacity-60" />
          : <ChevronRight className="w-3 h-3 opacity-60" />}
      </button>
      {open && (
        <div className="mt-1 mx-1 rounded-xl border border-surface-500/50 bg-surface-700/60 p-3 text-xs text-slate-300 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  )
}

const SUGGESTIONS = [
  'Which department has the highest resignation rate?',
  'What is the average performance rating of IT employees?',
  'Which hiring source produces the best performers?',
  'Why do employees in Sales resign more than HR?',
  'What training programs do top performers use?',
]

export default function Chat() {
  const [sessions, setSessions] = useState(() => {
    const saved = loadSessions()
    if (saved.length === 0) {
      const s = createSession()
      saveSessions([s])
      return [s]
    }
    return saved
  })

  const [currentId, setCurrentId] = useState(() => {
    const saved = loadSessions()
    return saved.length > 0 ? saved[0].id : null
  })

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const bottomRef = useRef(null)

  const currentSession = sessions.find(s => s.id === currentId) || sessions[0]
  const messages = currentSession?.messages || [WELCOME_MSG]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function patchCurrentSession(msgs) {
    setSessions(prev => {
      const updated = prev.map(s =>
        s.id === currentId
          ? { ...s, messages: msgs, updatedAt: Date.now(), title: getSessionTitle(msgs) }
          : s
      )
      saveSessions(updated)
      return updated
    })
  }

  function handleNewChat() {
    const s = createSession()
    setSessions(prev => {
      const updated = [s, ...prev]
      saveSessions(updated)
      return updated
    })
    setCurrentId(s.id)
    setInput('')
  }

  function handleSelectSession(id) {
    if (id === currentId) return
    setCurrentId(id)
    setInput('')
  }

  function handleDeleteSession(e, id) {
    e.stopPropagation()
    setConfirmDeleteId(id)
  }

  function confirmDelete() {
    const id = confirmDeleteId
    setConfirmDeleteId(null)
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== id)
      if (updated.length === 0) {
        const s = createSession()
        saveSessions([s])
        setCurrentId(s.id)
        return [s]
      }
      saveSessions(updated)
      if (currentId === id) setCurrentId(updated[0].id)
      return updated
    })
  }

  async function handleSend(text) {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')

    const userMsg = { role: 'user', content: msg }
    const withUser = [...messages, userMsg]
    patchCurrentSession(withUser)
    setLoading(true)

    try {
      const history = messages
        .filter((_, i) => i !== 0)
        .map(m => ({ role: m.role, content: m.content }))

      const res = await sendChatMessage(msg, history)
      patchCurrentSession([...withUser, {
        role: 'assistant',
        content: res.data.reply,
        visualization: res.data.visualization || null,
        reasoning: res.data.reasoning || null,
        pipeline: res.data.pipeline || null,
        recordCount: res.data.recordCount ?? null,
      }])
    } catch (err) {
      patchCurrentSession([...withUser, {
        role: 'assistant',
        content: `Error: ${err.response?.data?.error || err.message}. Make sure the server is running.`,
        error: true,
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4 relative">

      {/* ── Chat Window ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="card p-4 mb-4 flex items-center gap-3 border-brand-500/20 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-brand-400" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm">AI-Powered HR Chat</p>
            <p className="text-slate-500 text-xs truncate">NL2Query · MongoDB Aggregation · Real-time Grounding</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-brand-500/15 border border-brand-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-brand-400" />
                </div>
              )}

              <div className={msg.role === 'user' ? 'max-w-[80%]' : 'flex-1 min-w-0'}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-500 text-white rounded-tr-sm'
                    : msg.error
                      ? 'bg-red-500/10 border border-red-500/20 text-red-300 rounded-tl-sm'
                      : 'card rounded-tl-sm text-slate-200'
                }`}>
                  {msg.role === 'assistant' && !msg.error
                    ? renderMarkdown(msg.content)
                    : msg.content}
                </div>

                {/* Record count badge + small sample warning */}
                {msg.role === 'assistant' && !msg.error && msg.recordCount !== null && msg.recordCount !== undefined && (
                  <div className="flex items-center gap-2 mt-1.5 px-1">
                    {msg.recordCount === 0 ? (
                      <span className="flex items-center gap-1 text-[10px] text-slate-600">
                        <Database className="w-2.5 h-2.5" />
                        No records matched — answer based on domain knowledge
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-slate-600">
                        <Database className="w-2.5 h-2.5 text-brand-500/60" />
                        Retrieved {msg.recordCount} record{msg.recordCount !== 1 ? 's' : ''} from employees collection
                      </span>
                    )}
                    {msg.recordCount > 0 && msg.recordCount < 10 && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-500/80 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Small sample — interpret with caution
                      </span>
                    )}
                  </div>
                )}

                {/* Collapsible: AI Reasoning */}
                {msg.role === 'assistant' && !msg.error && msg.reasoning && (
                  <CollapsiblePanel icon={Brain} label="View AI Reasoning" color="purple">
                    {renderMarkdown(msg.reasoning)}
                  </CollapsiblePanel>
                )}

                {/* Collapsible: MongoDB Query */}
                {msg.role === 'assistant' && !msg.error && msg.pipeline && msg.pipeline.length > 0 && (
                  <CollapsiblePanel icon={Database} label="View MongoDB Query" color="brand">
                    <pre className="text-[10px] text-slate-400 whitespace-pre-wrap break-all font-mono overflow-x-auto">
                      {JSON.stringify(msg.pipeline, null, 2)}
                    </pre>
                  </CollapsiblePanel>
                )}

                {msg.role === 'assistant' && msg.visualization && (
                  <ChatVisualization viz={msg.visualization} />
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-surface-500 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start animate-slide-up">
              <div className="w-7 h-7 rounded-full bg-brand-500/15 border border-brand-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-brand-400" />
              </div>
              <div className="card rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
                  Searching employee records…
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length === 1 && (
          <div className="mb-3 shrink-0">
            <p className="text-xs text-slate-600 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-surface-400 text-slate-400 hover:text-white hover:border-brand-500/50 hover:bg-brand-500/8 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="card flex items-center gap-3 p-2 border-surface-400 focus-within:border-brand-500/50 transition-all shrink-0">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask anything about your employees…"
            className="flex-1 bg-transparent text-white placeholder-slate-600 text-sm outline-none px-2"
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="w-8 h-8 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shrink-0"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      {/* ── Chat History Panel ── */}
      <div className="w-64 flex flex-col card border-surface-500/60 overflow-hidden shrink-0">
        <div className="px-4 py-3 border-b border-surface-500/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
            <p className="text-sm font-semibold text-white">History</p>
          </div>
          <button
            onClick={handleNewChat}
            title="New Chat"
            className="w-7 h-7 rounded-lg bg-brand-500/15 hover:bg-brand-500/30 border border-brand-500/30 flex items-center justify-center transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-brand-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <MessageSquare className="w-7 h-7 text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-600">No history yet</p>
            </div>
          ) : (
            sessions.map(session => (
              <button
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 transition-all group border-b border-surface-500/30 ${
                  session.id === currentId
                    ? 'bg-brand-500/10 border-l-2 border-l-brand-500'
                    : 'hover:bg-surface-600/40 border-l-2 border-l-transparent'
                }`}
              >
                <MessageSquare className={`w-3 h-3 mt-0.5 shrink-0 ${session.id === currentId ? 'text-brand-400' : 'text-slate-600'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate leading-tight ${session.id === currentId ? 'text-brand-300' : 'text-slate-300 group-hover:text-white'}`}>
                    {session.title}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-2.5 h-2.5 text-slate-700" />
                    <p className="text-[10px] text-slate-600">{formatDate(session.updatedAt)}</p>
                  </div>
                </div>
                <button
                  onClick={e => handleDeleteSession(e, session.id)}
                  title="Delete"
                  className="w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all shrink-0 mt-0.5"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-surface-500/60 shrink-0">
          <p className="text-[10px] text-slate-600">
            {sessions.length} conversation{sessions.length !== 1 ? 's' : ''} saved locally
          </p>
        </div>
      </div>

      {/* ── Delete Confirmation Popup ── */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmDeleteId(null)}
          />
          <div className="relative bg-[#111218] border border-surface-400 rounded-2xl shadow-2xl p-6 w-80 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Delete Chat?</p>
                <p className="text-slate-500 text-xs mt-0.5">This conversation will be permanently removed.</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs bg-surface-600/50 rounded-lg px-3 py-2 border border-surface-500/40 truncate">
              {sessions.find(s => s.id === confirmDeleteId)?.title || 'New Chat'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2 rounded-lg border border-surface-400 text-slate-400 hover:text-white hover:border-surface-300 text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 rounded-lg bg-red-500/90 hover:bg-red-500 text-white text-sm font-medium transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
