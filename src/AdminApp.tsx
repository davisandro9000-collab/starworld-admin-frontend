import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import AdminLayout from './components/layout/AdminLayout'
import AdminProtectedRoute from './components/layout/AdminProtectedRoute'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminToastContainer from './components/ui/Toast'

// Page imports — these will be created in Session 13B
import DepositsQueuePage from './pages/DepositsQueuePage'
import UsersPage from './pages/UsersPage'
import NotificationsPage from './pages/NotificationsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import PrizesPage from './pages/PrizesPage'
import CelebritiesPage from './pages/CelebritiesPage'
import TicketsPage from './pages/TicketsPage'
import TiersPage from './pages/TiersPage'
import AuditLogPage from './pages/AuditLogPage'

export default function AdminApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AdminToastContainer />
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/deposits" replace />} />
            <Route path="deposits"      element={<DepositsQueuePage />} />
            <Route path="users"         element={<UsersPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="analytics"     element={<AnalyticsPage />} />
            <Route path="prizes"        element={<PrizesPage />} />
            <Route path="celebrities"   element={<CelebritiesPage />} />
            <Route path="tickets"       element={<TicketsPage />} />
            <Route path="tiers"         element={<TiersPage />} />
            <Route path="audit"         element={<AuditLogPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}