import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Cctv, LockKeyhole, LockKeyholeOpen, ScanFace, ShieldCheck, VideoOff } from 'lucide-react'
import { useHomeStore } from '../../store/useHomeStore'
import { Toggle } from '../ui/GlassCard'

const FEEDS = [
  { id: 'door', name: 'Front Door', scene: 'door', motion: true },
  { id: 'drive', name: 'Driveway', scene: 'drive' },
  { id: 'yard', name: 'Backyard', scene: 'yard' },
  { id: 'living', name: 'Living Room', scene: 'living' },
]

function FeedScene({ scene }) {
  switch (scene) {
    case 'door':
      return (
        <svg viewBox="0 0 160 90" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice">
          <rect width="160" height="90" fill="#1a2030" />
          <rect y="70" width="160" height="20" fill="#232a3b" />
          <rect x="60" y="18" width="40" height="56" rx="2" fill="#2c3549" stroke="#3e4a63" />
          <circle cx="93" cy="48" r="1.6" fill="#c9a86a" />
          <rect x="20" y="24" width="26" height="22" fill="#2a3346" stroke="#3a455d" />
          <rect x="114" y="24" width="26" height="22" fill="#2a3346" stroke="#3a455d" />
          <ellipse cx="80" cy="76" rx="22" ry="3" fill="#1d2433" />
          <circle cx="128" cy="64" r="8" fill="#2f4a36" />
        </svg>
      )
    case 'drive':
      return (
        <svg viewBox="0 0 160 90" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice">
          <rect width="160" height="90" fill="#18202e" />
          <polygon points="50,90 110,90 92,34 70,34" fill="#262e3f" />
          <line x1="80" y1="40" x2="80" y2="90" stroke="#3b4660" strokeDasharray="5 6" />
          <rect x="84" y="50" width="30" height="16" rx="4" fill="#3b4a6b" />
          <rect x="88" y="44" width="20" height="9" rx="3" fill="#33405c" />
          <circle cx="90" cy="67" r="3" fill="#0d1018" />
          <circle cx="108" cy="67" r="3" fill="#0d1018" />
          <circle cx="24" cy="40" r="14" fill="#263b2d" />
          <circle cx="140" cy="36" r="16" fill="#22352a" />
        </svg>
      )
    case 'yard':
      return (
        <svg viewBox="0 0 160 90" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice">
          <rect width="160" height="90" fill="#172030" />
          <rect y="52" width="160" height="38" fill="#1f3326" />
          <rect x="40" y="58" width="80" height="22" rx="10" fill="#1d4a5c" />
          <rect x="44" y="61" width="72" height="16" rx="8" fill="#2a6c84" opacity="0.6" />
          <rect x="6" y="30" width="148" height="3" fill="#2e3a4f" />
          {[12, 28, 44, 60, 76, 92, 108, 124, 140].map((x) => (
            <rect key={x} x={x} y="30" width="2" height="24" fill="#2e3a4f" />
          ))}
          <circle cx="140" cy="44" r="12" fill="#2a4532" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 160 90" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice">
          <rect width="160" height="90" fill="#1b2030" />
          <rect y="66" width="160" height="24" fill="#2b2622" />
          <rect x="50" y="14" width="56" height="32" rx="1" fill="#0b0d14" stroke="#30384b" />
          <rect x="52" y="16" width="52" height="28" fill="#3b2b5c" opacity="0.7" />
          <rect x="30" y="54" width="90" height="16" rx="4" fill="#404858" />
          <rect x="30" y="48" width="90" height="8" rx="3" fill="#4a5366" />
          <circle cx="134" cy="40" r="7" fill="#e8d6b0" opacity="0.6" />
          <rect x="133" y="46" width="2" height="22" fill="#30384b" />
        </svg>
      )
  }
}

function Feed({ feed, armed, isNight, now, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.05 * index }}
      whileHover={{ scale: 1.015 }}
      className="group relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black"
    >
      <div className={`absolute inset-0 transition-[filter] duration-700 ${isNight ? 'hue-rotate-[70deg] saturate-[1.6] brightness-[1.15]' : ''}`}>
        <FeedScene scene={feed.scene} />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.035)_0px,rgba(255,255,255,0.035)_1px,transparent_1px,transparent_3px)]" />
      <div
        className="pointer-events-none absolute -inset-[20%] opacity-[0.07] mix-blend-screen"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")",
          animation: 'noise 0.4s steps(3) infinite',
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" style={{ animation: 'scan 4s linear infinite' }} />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.7)]" />

      {feed.motion && armed && (
        <motion.div
          className="absolute rounded-md border-2 border-amber-300/80"
          style={{ left: '40%', top: '22%', width: '18%', height: '58%' }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          <span className="absolute -top-5 left-0 rounded bg-amber-300 px-1 text-[9px] font-bold whitespace-nowrap text-black">PERSON 92%</span>
        </motion.div>
      )}

      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2.5">
        <span className="flex items-center gap-1.5 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white backdrop-blur">
          <span className={`size-1.5 rounded-full ${armed ? 'animate-pulse bg-rose-500' : 'bg-slate-500'}`} />
          {armed ? 'REC' : 'IDLE'}
        </span>
        <span className="rounded-md bg-black/50 px-2 py-0.5 font-mono text-[10px] tabular-nums text-white/80 backdrop-blur">
          {now.toLocaleTimeString([], { hour12: false })}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-2.5 pt-6">
        <span className="text-xs font-semibold text-white">{feed.name}</span>
        <span className="text-[10px] text-white/60">CAM-0{index + 1} · 4K</span>
      </div>

      <AnimatePresence>
        {!armed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 grid place-items-center bg-[#0A0D14]/80 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-1.5 text-slate-400">
              <VideoOff size={20} />
              <span className="text-xs">Feed paused</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const TONE = { success: 'bg-emerald-400', warn: 'bg-amber-400', info: 'bg-indigo-400' }

export function SecurityFeeds() {
  const armed = useHomeStore((s) => s.devices.cameras)
  const locked = useHomeStore((s) => s.devices.lock)
  const isNight = useHomeStore((s) => s.isNight)
  const events = useHomeStore((s) => s.events)
  const toggleDevice = useHomeStore((s) => s.toggleDevice)
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FEEDS.map((f, i) => (
          <Feed key={f.id} feed={f} armed={armed} isNight={isNight} now={now} index={i} />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-3">
            <span className={`grid size-10 place-items-center rounded-xl ${armed ? 'bg-pink-400/15 text-pink-300' : 'bg-white/5 text-slate-400'}`}>
              <Cctv size={18} />
            </span>
            <div className="flex-1">
              <div className="font-semibold text-white">Camera system</div>
              <div className="text-xs text-slate-400">{armed ? '4 cameras recording' : 'Recording paused'}</div>
            </div>
            <Toggle checked={armed} onChange={() => toggleDevice('cameras')} accent="#F472B6" label="Arm cameras" />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className={`grid size-10 place-items-center rounded-xl ${locked ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-400/15 text-amber-300'}`}>
              {locked ? <LockKeyhole size={18} /> : <LockKeyholeOpen size={18} />}
            </span>
            <div className="flex-1">
              <div className="font-semibold text-white">Front door</div>
              <div className="text-xs text-slate-400">{locked ? 'Locked · Auto-lock on' : 'Unlocked'}</div>
            </div>
            <Toggle checked={locked} onChange={() => toggleDevice('lock')} accent="#34D399" label="Lock door" />
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-xs text-emerald-200">
            <ShieldCheck size={14} /> All entry points secure · Face ID enrolled for 3 people
            <ScanFace size={14} className="ml-auto" />
          </div>
        </div>
        <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center gap-2 font-semibold text-white">
            <Bell size={15} className="text-slate-400" /> Activity
          </div>
          <ul className="flex flex-col gap-2.5">
            <AnimatePresence initial={false}>
              {events.slice(0, 6).map((e) => (
                <motion.li
                  key={e.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2.5 text-sm"
                >
                  <span className={`size-1.5 shrink-0 rounded-full ${TONE[e.tone]}`} />
                  <span className="truncate text-slate-300">{e.text}</span>
                  <span className="ml-auto shrink-0 text-xs tabular-nums text-slate-500">{e.time}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </div>
    </div>
  )
}
