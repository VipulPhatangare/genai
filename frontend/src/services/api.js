import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// Data
export const uploadCSV = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/data/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
}
export const getDataStatus = () => api.get('/data/status')
export const clearCache = () => api.delete('/data/clear-cache')

// Performance
export const getQ1 = () => api.get('/analysis/performance/q1')
export const getQ2 = () => api.get('/analysis/performance/q2')
export const getQ3 = () => api.get('/analysis/performance/q3')
export const getQ4 = () => api.get('/analysis/performance/q4')
export const getQ5 = () => api.get('/analysis/performance/q5')

// Training
export const getQ6 = () => api.get('/analysis/training/q6')
export const getQ7 = () => api.get('/analysis/training/q7')
export const getQ8 = () => api.get('/analysis/training/q8')
export const getQ9 = () => api.get('/analysis/training/q9')
export const getQ10 = () => api.get('/analysis/training/q10')

// Behavioral
export const getQ11 = () => api.get('/analysis/behavioral/q11')
export const getQ12 = () => api.get('/analysis/behavioral/q12')
export const getQ13 = () => api.get('/analysis/behavioral/q13')
export const getQ14 = () => api.get('/analysis/behavioral/q14')

// Projects
export const getQ15 = () => api.get('/analysis/projects/q15')
export const getQ16 = () => api.get('/analysis/projects/q16')
export const getQ17 = () => api.get('/analysis/projects/q17')
export const getQ18 = () => api.get('/analysis/projects/q18')

// Attrition
export const getQ19 = () => api.get('/analysis/attrition/q19')
export const getQ20 = () => api.get('/analysis/attrition/q20')
export const getQ21 = () => api.get('/analysis/attrition/q21')

// Compensation
export const getQ22 = () => api.get('/analysis/compensation/q22')
export const getQ23 = () => api.get('/analysis/compensation/q23')
export const getQ24 = () => api.get('/analysis/compensation/q24')

// Recruitment
export const getQ25 = () => api.get('/analysis/recruitment/q25')

// RAG
export const sendChatMessage = (message, history = []) => api.post('/rag/chat', { message, history })
