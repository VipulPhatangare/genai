import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload as UploadIcon, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import { uploadCSV } from '../services/api'

export default function Upload() {
  const [stage, setStage] = useState('idle') // idle | uploading | success | error
  const [message, setMessage] = useState('')
  const [count, setCount] = useState(0)
  const [dragging, setDragging] = useState(false)
  const navigate = useNavigate()

  async function handleFile(file) {
    if (!file) return
    setStage('uploading')
    setMessage('')
    try {
      const res = await uploadCSV(file)
      setCount(res.data.count)
      setStage('success')
      setMessage(res.data.message)
    } catch (err) {
      setStage('error')
      setMessage(err.response?.data?.error || err.message)
    }
  }

  const onDrop = useCallback(e => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500/15 border border-brand-500/30 mb-4 shadow-brand">
            <FileSpreadsheet className="w-8 h-8 text-brand-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Upload Employee Data</h1>
          <p className="text-slate-400 mt-2 text-sm">Upload your CSV file to begin HR analytics</p>
        </div>

        <div className="card p-6">
          {/* Drop zone */}
          {(stage === 'idle' || stage === 'error') && (
            <div
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
                dragging
                  ? 'border-brand-500 bg-brand-500/10'
                  : 'border-surface-400 hover:border-brand-500/50 hover:bg-brand-500/5'
              }`}
              onClick={() => document.getElementById('file-input').click()}
            >
              <UploadIcon className={`w-10 h-10 mx-auto mb-3 ${dragging ? 'text-brand-400' : 'text-slate-600'}`} />
              <p className="text-white font-medium">Drop your CSV file here</p>
              <p className="text-slate-500 text-sm mt-1">or click to browse</p>
              <p className="text-slate-600 text-xs mt-3">Supports: .csv files</p>
              <input id="file-input" type="file" accept=".csv" className="hidden"
                onChange={e => handleFile(e.target.files[0])} />
            </div>
          )}

          {stage === 'uploading' && (
            <div className="flex flex-col items-center py-10 gap-3">
              <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
              <p className="text-white font-medium">Uploading & processing CSV…</p>
              <p className="text-slate-500 text-sm">Inserting records into MongoDB</p>
            </div>
          )}

          {stage === 'success' && (
            <div className="space-y-5">
              <div className="flex items-start gap-3 p-3 bg-emerald-500/8 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-emerald-300 font-medium text-sm">CSV Uploaded Successfully</p>
                  <p className="text-slate-400 text-xs mt-0.5">{count.toLocaleString()} employee records imported</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {stage === 'error' && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-300 text-sm">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
