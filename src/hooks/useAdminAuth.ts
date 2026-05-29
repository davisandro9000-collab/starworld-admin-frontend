import { useEffect } from 'react'
import { useAdminAuthStore } from '../stores/adminAuthStore'
import { adminGetMe } from '../api/auth.api'

export function useAdminAuth() {
  const { adminUser, adminToken, isLoading, setAdmin, setLoading, logout } = useAdminAuthStore()

  useEffect(() => {
    if (adminToken && !adminUser) {
      adminGetMe()
        .then(u => setAdmin(u, adminToken))
        .catch(() => { logout(); setLoading(false) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  return { adminUser, adminToken, isLoading, logout }
}