import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useHomeStore } from '../store/useHomeStore'
import { VIEWS } from './Dock'
import { EnergyAnalytics } from './views/EnergyAnalytics'
import { SecurityFeeds } from './views/SecurityFeeds'
import { Automations } from './views/Automations'

const CONTENT = { energy: EnergyAnalytics, security: SecurityFeeds, automations: Automations }

const SUBTITLES = {
  energy: 'Live consumption, costs and per-room breakdown',
  security: 'Cameras, locks and recent activity',
  automations: 'Scenes and rules that run your home',
}

export function ViewDrawer() {
  const view = useHomeStore((s) => s.view)
  const setView = useHomeStore((s) => s.setView)
  const open = view !== 'floorplan'
  const meta = VIEWS.find((v) => v.id === view)
  const Content = CONTENT[view]

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setView('floorplan')
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setView])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setView('floorplan')}
            className="fixed inset-0 z-40 bg-[#05070B]/55 backdrop-blur-[3px]"
          />
          <motion.section
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label={meta.label}
            initial={{ y: '105%', opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '105%', opacity: 0.6 }}
            transition={{ type: 'spring', stiffness: 170, damping: 26 }}
            className="glass-highlight fixed inset-x-3 bottom-[108px] z-50 mx-auto flex max-h-[calc(100vh-140px)] max-w-6xl flex-col rounded-3xl border border-white/10 bg-[#0E1220]/75 shadow-2xl backdrop-blur-2xl"
          >
            <header className="flex items-center gap-3 border-b border-white/5 px-6 py-4">
              <span className="grid size-10 place-items-center rounded-2xl" style={{ background: `${meta.color}22`, color: meta.color }}>
                <meta.icon size={19} />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold text-white">{meta.label}</h2>
                <p className="text-xs text-slate-400">{SUBTITLES[view]}</p>
              </div>
              <button
                type="button"
                onClick={() => setView('floorplan')}
                aria-label="Close"
                className="ml-auto grid size-9 cursor-pointer place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:rotate-90 hover:bg-white/10 hover:text-white"
              >
                <X size={16} />
              </button>
            </header>
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="scrollbar-none overflow-y-auto p-6"
              >
                <Content />
              </motion.div>
            </AnimatePresence>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  )
}
