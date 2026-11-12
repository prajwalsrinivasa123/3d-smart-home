import { useState } from 'react'
import { motion } from 'framer-motion'
import { BatteryCharging, Bot, Clapperboard, Clock, DoorClosed, MoonStar, Play, Plane, Sunrise, Wind } from 'lucide-react'
import { useHomeStore } from '../../store/useHomeStore'
import { Toggle } from '../ui/GlassCard'

const SCENES = [
  { id: 'morning', label: 'Good Morning', desc: 'Day light · warm 80%', icon: Sunrise, color: '#FBBF24', mode: 'home', night: false },
  { id: 'leave', label: 'Leave Home', desc: 'Lights off · lock · arm', icon: Plane, color: '#22D3EE', mode: 'away' },
  { id: 'movie', label: 'Movie Night', desc: 'Neon 22% · TV on', icon: Clapperboard, color: '#818CF8', mode: 'cinema' },
  { id: 'bed', label: 'Bedtime', desc: 'Dim sunset · eco climate', icon: MoonStar, color: '#F472B6', mode: 'night' },
]

const RULES = [
  { id: 'r1', icon: DoorClosed, title: 'Auto-lock front door', trigger: 'Every day at 23:00', color: '#34D399', enabled: true },
  { id: 'r2', icon: Wind, title: 'Pre-cool before arrival', trigger: 'Weekdays 17:30 · 22°C', color: '#38BDF8', enabled: true },
  { id: 'r3', icon: Bot, title: 'Vacuum when away', trigger: 'When everyone leaves', color: '#22D3EE', enabled: true },
  { id: 'r4', icon: BatteryCharging, title: 'Energy saver', trigger: 'If usage > 3.5 kW for 10 min', color: '#FFB347', enabled: false },
  { id: 'r5', icon: Clock, title: 'Wind-down lighting', trigger: 'Sunset + 30 min · warm 40%', color: '#F472B6', enabled: true },
]

export function Automations() {
  const setMode = useHomeStore((s) => s.setMode)
  const isNight = useHomeStore((s) => s.isNight)
  const toggleNight = useHomeStore((s) => s.toggleNight)
  const [rules, setRules] = useState(RULES)
  const [ran, setRan] = useState(null)

  const runScene = (scene) => {
    setMode(scene.mode)
    if (scene.night === false && isNight) toggleNight()
    setRan(scene.id)
    setTimeout(() => setRan((r) => (r === scene.id ? null : r)), 1600)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
      <div>
        <h4 className="mb-3 font-display font-semibold text-white">Scenes</h4>
        <div className="grid grid-cols-2 gap-3">
          {SCENES.map((s, i) => {
            const Icon = s.icon
            return (
              <motion.button
                key={s.id}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => runScene(s)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left"
              >
                <span
                  className="absolute -top-10 -right-10 size-28 rounded-full opacity-25 blur-2xl transition-opacity group-hover:opacity-50"
                  style={{ background: s.color }}
                />
                <span className="relative grid size-10 place-items-center rounded-xl" style={{ background: `${s.color}22`, color: s.color }}>
                  <Icon size={18} />
                </span>
                <div className="relative mt-3 font-semibold text-white">{s.label}</div>
                <div className="relative text-xs text-slate-400">{s.desc}</div>
                <span className="absolute right-3 bottom-3 grid size-7 place-items-center rounded-full bg-white/10 text-white">
                  <Play size={12} fill="currentColor" />
                </span>
                {ran === s.id && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 grid place-items-center bg-[#0A0D14]/70 text-sm font-semibold text-emerald-300 backdrop-blur-sm"
                  >
                    Scene applied ✓
                  </motion.span>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      <div>
        <h4 className="mb-3 font-display font-semibold text-white">Rules</h4>
        <div className="flex flex-col gap-2">
          {rules.map((r, i) => {
            const Icon = r.icon
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className={`flex items-center gap-3 rounded-2xl border p-3 transition-colors ${
                  r.enabled ? 'border-white/10 bg-white/[0.05]' : 'border-white/5 bg-white/[0.02]'
                }`}
              >
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-xl transition-colors"
                  style={{ background: r.enabled ? `${r.color}22` : 'rgba(255,255,255,0.04)', color: r.enabled ? r.color : '#64748B' }}
                >
                  <Icon size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className={`truncate font-medium ${r.enabled ? 'text-white' : 'text-slate-400'}`}>{r.title}</div>
                  <div className="truncate text-xs text-slate-500">{r.trigger}</div>
                </div>
                <Toggle
                  checked={r.enabled}
                  accent={r.color}
                  label={`Toggle ${r.title}`}
                  onChange={(v) => setRules((rs) => rs.map((x) => (x.id === r.id ? { ...x, enabled: v } : x)))}
                />
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
