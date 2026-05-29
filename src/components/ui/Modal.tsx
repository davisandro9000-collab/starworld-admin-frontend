import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

interface ModalProps {
  open: boolean; onClose: () => void; title?: string
  hideTitle?: boolean; children: React.ReactNode
  className?: string; maxWidth?: string
}

export default function Modal({ open, onClose, title, hideTitle=false, children, className, maxWidth='max-w-md' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && <>
        <motion.div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} />
        <motion.div className={cn('fixed z-[60] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass rounded-2xl w-[90vw] shadow-2xl', maxWidth, className)}
          initial={{opacity:0,scale:0.95,y:10}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:10}} transition={{duration:0.2}}>
          {!hideTitle && title && (
            <div className="flex items-center justify-between px-5 py-4 border-b border-sw-border">
              <h2 className="font-heading font-bold text-white">{title}</h2>
              <button onClick={onClose} className="text-white/30 hover:text-white text-lg transition-colors">✕</button>
            </div>
          )}
          {hideTitle && <button onClick={onClose} className="absolute top-3 right-3 text-white/30 hover:text-white z-10 text-lg transition-colors">✕</button>}
          <div className="p-5">{children}</div>
        </motion.div>
      </>}
    </AnimatePresence>,
    document.body
  )
}