import { Routes, Route, Navigate } from 'react-router-dom'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  )
}