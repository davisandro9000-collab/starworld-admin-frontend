import { AnimatePresence, motion } from 'framer-motion'
import { useAdminNotifStore } from '../../stores/adminNotifStore'

const variantStyle = {
  success: 'border-l-win text-win',
  error:   'border-l-loss text-loss',
  info:    'border-l-cyan text-cyan',
  warning: 'border-l-gold text-gold',
}

export default function AdminToastContainer() {
  const { toasts, remove } = useAdminNotifStore()
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id}
            className={`pointer-events-auto glass rounded-xl px-4 py-3 border-l-4 min-w-[240px] max-w-xs ${variantStyle[t.variant]}`}
            initial={{opacity:0,x:40}} animate={{opacity:1,x:0}} exit={{opacity:0,x:40}}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-heading font-bold text-sm text-white">{t.title}</p>
                {t.body && <p className="text-white/50 text-xs mt-0.5">{t.body}</p>}
              </div>
              <button onClick={() => remove(t.id)} className="text-white/30 hover:text-white text-sm mt-0.5">✕</button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
