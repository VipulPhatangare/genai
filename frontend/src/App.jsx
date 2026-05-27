import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Upload from './pages/Upload'
import Dashboard from './pages/Dashboard'
import Section1 from './pages/Section1'
import Section2 from './pages/Section2'
import Section3 from './pages/Section3'
import Section4 from './pages/Section4'
import Section5 from './pages/Section5'
import Section6 from './pages/Section6'
import Section7 from './pages/Section7'
import Chat from './pages/Chat'
import ProjectInfo from './pages/ProjectInfo'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/upload" element={<Upload />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="performance" element={<Section1 />} />
          <Route path="training" element={<Section2 />} />
          <Route path="behavioral" element={<Section3 />} />
          <Route path="projects" element={<Section4 />} />
          <Route path="attrition" element={<Section5 />} />
          <Route path="compensation" element={<Section6 />} />
          <Route path="recruitment" element={<Section7 />} />
          <Route path="chat" element={<Chat />} />
          <Route path="project" element={<ProjectInfo />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
