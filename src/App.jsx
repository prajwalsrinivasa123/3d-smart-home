import { lazy, Suspense, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Move3d } from 'lucide-react'
import { ROOM_MAP } from './data/rooms'
import { useHomeStore } from './store/useHomeStore'
import { Header } from './components/Header'
import { LeftPanel } from './components/LeftPanel'
import { RightPanel } from './components/RightPanel'
import { Dock } from './components/Dock'
import { ViewDrawer } from './components/ViewDrawer'

const House3D = lazy(() => import('./components/House3D'))

function Backdrop() {
  const isNight = useHomeStore((s) => s.isNight)
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-obsidian">
      <div
        className="absolute inset-0 transition-opacity duration-[1500ms]"
        style={{
          opacity: isNight ? 0 : 1,
          background:
            'radial-gradient(60% 50% at 50% 45%, rgba(148,163,184,0.16), transparent 70%), radial-gradient(40% 40% at 85% 10%, rgba(251,191,36,0.10), transparent 70%), radial-gradient(45% 45% at 10% 90%, rgba(56,189,248,0.08), transparent 70%)',
        }}
      />
      <div
        className="absolute inset-0 transition-opacity duration-[1500ms]"
        style={{
          opacity: isNight ? 1 : 0,
          background:
            'radial-gradient(55% 45% at 50% 48%, rgba(99,102,241,0.20), transparent 70%), radial-gradient(35% 35% at 85% 8%, rgba(192,38,211,0.10), transparent 70%), radial-gradient(40% 40% at 10% 92%, rgba(34,211,238,0.07), transparent 70%)',
        }}
      />
    </div>
  )
}

function SceneHint() {
  const focus = useHomeStore((s) => s.focus)
  const setFocus = useHomeStore((s) => s.setFocus)
  const room = ROOM_MAP[focus]
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={focus}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-[#0A0D14]/50 py-1.5 pr-4 pl-1.5 text-xs text-slate-300 shadow-2xl backdrop-blur-xl"
      >
        {room ? (
          <button
            type="button"
            onClick={() => setFocus('overview')}
            className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 font-medium text-white transition hover:bg-white/20"
          >
            <ArrowLeft size={13} /> Overview
          </button>
        ) : (
          <span className="grid size-6 place-items-center rounded-full bg-indigo-400/20 text-indigo-300">
            <Move3d size={13} />
          </span>
        )}
        {room ? (
          <span>
            Viewing <span className="font-semibold text-white">{room.name}</span>
          </span>
        ) : (
          <span>Drag to orbit · Scroll to zoom · Click a room to focus</span>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  const tick = useHomeStore((s) => s.tick)
  useEffect(() => {
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [tick])

  return (
    <main className="relative isolate flex min-h-screen flex-col gap-3 p-3 pb-32 lg:block lg:h-screen lg:overflow-hidden lg:p-0">
      <Backdrop />

      <div className="relative z-0 order-2 h-[62vh] overflow-hidden rounded-3xl border border-white/10 lg:fixed lg:inset-0 lg:h-auto lg:rounded-none lg:border-0">
        <Suspense fallback={<div className="grid size-full place-items-center text-sm text-slate-500">Building your home…</div>}>
          <House3D />
        </Suspense>
      </div>

      <div className="contents lg:pointer-events-none lg:absolute lg:inset-0 lg:z-30 lg:flex lg:flex-col lg:gap-4 lg:p-5">
        <div className="order-1 relative z-30">
          <Header />
        </div>
        <div className="order-3 relative z-30 flex flex-col gap-3 lg:min-h-0 lg:flex-1 lg:flex-row lg:items-start lg:justify-between">
          <aside className="scrollbar-none lg:max-h-full lg:overflow-y-auto lg:rounded-3xl">
            <LeftPanel />
          </aside>
          <div className="pointer-events-none hidden flex-1 flex-col items-center justify-end self-stretch pb-[104px] lg:flex">
            <SceneHint />
          </div>
          <aside className="scrollbar-none lg:max-h-full lg:overflow-y-auto lg:rounded-3xl">
            <RightPanel />
          </aside>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center">
        <Dock />
      </div>
      <ViewDrawer />
    </main>
  )
}
