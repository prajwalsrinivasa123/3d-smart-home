import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clapperboard, CloudMoon, Home, MoonStar, Plane, Sun, SunMedium } from 'lucide-react'
import { HOME_MODES, OUTDOOR_TEMP } from '../data/rooms'
import { useHomeStore } from '../store/useHomeStore'
import { GlassCard } from './ui/GlassCard'

const MODE_ICONS = { home: Home, away: Plane, night: MoonStar, cinema: Clapperboard }

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function DayNightToggle() {
  const isNight = useHomeStore((s) => s.isNight)
  const toggleNight = useHomeStore((s) => s.toggleNight)
  return (
    <button
      type="button"
      onClick={toggleNight}
      aria-label={isNight ? 'Switch to day lighting' : 'Switch to night lighting'}
      className="relative flex h-11 w-[104px] cursor-pointer items-center rounded-2xl border border-white/10 bg-white/5 p-1"
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        className="absolute top-1 bottom-1 w-[48px] rounded-xl"
        style={{
          left: isNight ? 'calc(100% - 52px)' : '4px',
          background: isNight ? 'linear-gradient(135deg,#6366F1,#312E81)' : 'linear-gradient(135deg,#FCD34D,#FB923C)',
          boxShadow: isNight ? '0 0 24px -4px #818CF8' : '0 0 24px -4px #FBBF24',
        }}
      />
      <span className={`relative z-10 grid flex-1 place-items-center transition-colors ${isNight ? 'text-slate-500' : 'text-white'}`}>
        <SunMedium size={18} />
      </span>
      <span className={`relative z-10 grid flex-1 place-items-center transition-colors ${isNight ? 'text-white' : 'text-slate-500'}`}>
        <MoonStar size={17} />
      </span>
    </button>
  )
}

export function Header() {
  const now = useClock()
  const mode = useHomeStore((s) => s.mode)
  const setMode = useHomeStore((s) => s.setMode)
  const isNight = useHomeStore((s) => s.isNight)
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const WeatherIcon = isNight ? CloudMoon : Sun

  return (
    <GlassCard
      as="header"
      hover={false}
      className="pointer-events-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3"
    >
      <div className="flex items-center gap-4">
        <div className="relative grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-400 to-cyan-400 font-display text-sm font-bold text-[#0A0D14] shadow-[0_0_30px_-6px_#818CF8]">
          AX
          <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-[#0A0D14] bg-emerald-400" />
        </div>
        <div>
          <p className="text-xs text-slate-400">
            {greeting} ·{' '}
            <span className="tabular-nums">
              {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </p>
          <h1 className="font-display text-lg font-semibold tracking-tight text-white sm:text-xl">
            Welcome Home, <span className="bg-gradient-to-r from-indigo-300 to-cyan-200 bg-clip-text text-transparent">Alex</span>
          </h1>
        </div>
        <div className="ml-2 hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pr-3.5 pl-2 text-sm md:flex">
          <span className={`grid size-6 place-items-center rounded-full ${isNight ? 'bg-indigo-500/20 text-indigo-300' : 'bg-amber-400/20 text-amber-300'}`}>
            <WeatherIcon size={14} />
          </span>
          <span className="font-semibold tabular-nums text-white">{OUTDOOR_TEMP}°C</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">{isNight ? 'Clear Night' : 'Clear Sky'}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <nav className="flex items-center gap-1 rounded-2xl border border-white/10 bg-black/20 p-1" aria-label="Home mode">
          {HOME_MODES.map((m) => {
            const Icon = MODE_ICONS[m.id]
            const active = mode === m.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`relative flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="mode-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-xl border border-white/15 bg-white/10 shadow-[0_0_24px_-8px_#818CF8]"
                  />
                )}
                <Icon size={15} className="relative" />
                <span className="relative hidden sm:inline">{m.label}</span>
              </button>
            )
          })}
        </nav>
        <DayNightToggle />
      </div>
    </GlassCard>
  )
}
