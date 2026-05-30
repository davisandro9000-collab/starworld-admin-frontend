import { useEffect } from 'react';
import { useAdminAuthStore } from '../stores/adminAuthStore';
import { adminGetMe, type AdminUser } from '../api/auth.api';

export function useAdminAuth() {
  const { adminUser, adminToken, isLoading, setAdmin, setLoading, logout } = useAdminAuthStore();

  useEffect(() => {
    if (adminToken && !adminUser) {
      setLoading(true);
      adminGetMe()
        .then((user: AdminUser) => setAdmin(user, adminToken))
        .catch(() => {
          logout();
          setLoading(false);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [adminToken, adminUser, setAdmin, setLoading, logout]);

  return { adminUser, adminToken, isLoading, logout };
}