import { Navigate } from 'react-router-dom';
import { useAdminAuthStore } from '../../stores/adminAuthStore';

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { adminToken, isLoading } = useAdminAuthStore();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
  }

  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}