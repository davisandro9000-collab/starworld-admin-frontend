import { create } from 'zustand'

export interface AdminToast {
  id: string
  title: string
  body: string
  variant: 'success' | 'error' | 'info' | 'warning'
}

interface AdminNotifStore {
  toasts: AdminToast[]
  push: (t: Omit<AdminToast, 'id'>) => void
  remove: (id: string) => void
}

export const useAdminNotifStore = create<AdminNotifStore>((set) => ({
  toasts: [],
  push: (t) => {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 5000)
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}))
