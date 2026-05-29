// src/components/ui/adminHelpers.tsx
// Shared micro-components used across all admin pages.
// Import what you need: EmptyState, PageHeader, ConfirmModal, TablePagination, CopyBlock

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'
import { Button } from './Button'
import Modal from './Modal'

// ── PageHeader ────────────────────────────────────────────────
interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}
export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-white">{title}</h1>
        {subtitle && <p className="font-body text-white/40 text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────
interface EmptyStateProps { icon?: string; message: string }
export function EmptyState({ icon = '📭', message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-4xl mb-3">{icon}</span>
      <p className="font-body text-white/30 text-sm">{message}</p>
    </div>
  )
}

// ── ConfirmModal ──────────────────────────────────────────────
interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  body: string
  confirmLabel?: string
  variant?: 'danger' | 'success'
  loading?: boolean
  children?: React.ReactNode   // extra form content (reason select, textarea, etc.)
}
export function ConfirmModal({
  open, onClose, onConfirm, title, body,
  confirmLabel = 'Confirm', variant = 'danger', loading, children
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        <p className="font-body text-white/60 text-sm">{body}</p>
        {children}
        <div className="flex gap-3 justify-end mt-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  )
}

// ── TablePagination ───────────────────────────────────────────
interface PaginationProps {
  page: number
  totalPages: number
  onPage: (p: number) => void
}
export function TablePagination({ page, totalPages, onPage }: PaginationProps) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between mt-4">
      <span className="font-body text-white/30 text-xs">Page {page} of {totalPages}</span>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => onPage(page - 1)} disabled={page <= 1}>← Prev</Button>
        <Button variant="ghost" onClick={() => onPage(page + 1)} disabled={page >= totalPages}>Next →</Button>
      </div>
    </div>
  )
}

// ── CopyBlock ─────────────────────────────────────────────────
export function CopyBlock({ value, truncate = 24 }: { value: string; truncate?: number }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={copy}
      title={value}
      className="font-mono text-xs bg-sw-bg border border-sw-border rounded px-2 py-1 text-white/60 hover:text-white hover:border-sw-border-2 transition-colors flex items-center gap-2"
    >
      <span>{value.length > truncate ? value.slice(0, truncate) + '…' : value}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={copied ? 'ok' : 'copy'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={copied ? 'text-win' : 'text-white/30'}
        >
          {copied ? '✓' : '⎘'}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

// ── InitialsAvatar ────────────────────────────────────────────
export function InitialsAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const sz = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' }[size]
  return (
    <div className={cn('rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center font-heading font-bold text-gold flex-shrink-0', sz)}>
      {initials}
    </div>
  )
}
