import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useShallow } from 'zustand/react/shallow'
import { CircleDollarSign, Gauge, Leaf, Zap } from 'lucide-react'
import { ROOMS, LIGHT_PRESETS } from '../../data/rooms'
import { computePower, useHomeStore } from '../../store/useHomeStore'
import { AnimatedNumber, CATEGORY_META } from '../EnergyChart'

const RATE = 0.16

function Kpi({ icon: Icon, label, value, decimals, unit, accent, note, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
    >
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="grid size-7 place-items-center rounded-lg" style={{ background: `${accent}22`, color: accent }}>
          <Icon size={14} />
        </span>
        {label}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <AnimatedNumber value={value} decimals={decimals} className="font-display text-2xl font-semibold tabular-nums text-white" />
        <span className="text-sm text-slate-400">{unit}</span>
      </div>
      <div className="mt-1 text-xs text-slate-500">{note}</div>
    </motion.div>
  )
}

export function EnergyAnalytics() {
  const energyToday = useHomeStore((s) => s.energyToday)
  const { rooms, thermostat, devices } = useHomeStore(
    useShallow((s) => ({ rooms: s.rooms, thermostat: s.thermostat, devices: s.devices })),
  )
  const { total, breakdown, perRoom } = useMemo(
    () => computePower({ rooms, thermostat, devices }),
    [rooms, thermostat, devices],
  )
  const currentHour = new Date().getHours()

  const hourly = useMemo(
    () =>
      Array.from({ length: 24 }, (_, h) => {
        const morning = Math.exp(-((h - 8) ** 2) / 6) * 1.6
        const evening = Math.exp(-((h - 20) ** 2) / 8) * 2.4
        return 0.45 + morning + evening + ((h * 37) % 10) / 25
      }),
    [],
  )
  const maxHour = Math.max(...hourly, total)
  const maxRoom = Math.max(...Object.values(perRoom), 0.5)

  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Kpi icon={Zap} label="Right now" value={total} decimals={2} unit="kW" accent="#FFB347" note="Live draw" delay={0.05} />
          <Kpi icon={Gauge} label="Today" value={energyToday} decimals={1} unit="kWh" accent="#818CF8" note="−8.2% vs yesterday" delay={0.1} />
          <Kpi icon={CircleDollarSign} label="Est. cost" value={energyToday * RATE} decimals={2} unit="USD" accent="#34D399" note={`@ $${RATE}/kWh`} delay={0.15} />
          <Kpi icon={Leaf} label="Solar offset" value={energyToday * 0.37} decimals={1} unit="kWh" accent="#22D3EE" note="37% self-powered" delay={0.2} />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-semibold text-white">24-hour consumption</h4>
            <span className="text-xs text-slate-500">kWh per hour</span>
          </div>
          <div className="mt-5 flex h-44 items-end gap-1.5">
            {hourly.map((v, h) => {
              const isNow = h === currentHour
              const value = isNow ? total : v
              const future = h > currentHour
              return (
                <div key={h} className="group relative flex h-full flex-1 flex-col items-center justify-end">
                  <span className="pointer-events-none absolute -top-6 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] tabular-nums text-white opacity-0 transition group-hover:opacity-100">
                    {value.toFixed(2)}
                  </span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(value / maxHour) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18, delay: h * 0.015 }}
                    className="w-full rounded-t-md"
                    style={{
                      background: isNow
                        ? 'linear-gradient(180deg,#FFB347,#F472B6)'
                        : future
                          ? 'rgba(255,255,255,0.06)'
                          : 'linear-gradient(180deg,rgba(129,140,248,0.85),rgba(129,140,248,0.2))',
                      boxShadow: isNow ? '0 0 20px -2px #FFB347' : 'none',
                    }}
                  />
                </div>
              )
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] tabular-nums text-slate-500">
            {['00', '04', '08', '12', '16', '20', '23'].map((t) => (
              <span key={t}>{t}:00</span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h4 className="font-display font-semibold text-white">By room</h4>
          <div className="mt-4 flex flex-col gap-3.5">
            {ROOMS.map((r) => {
              const color = LIGHT_PRESETS[rooms[r.id].preset].color
              return (
                <div key={r.id}>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">{r.name}</span>
                    <span className="tabular-nums text-slate-400">{(perRoom[r.id] * 1000).toFixed(0)} W</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className="h-full rounded-full"
                      animate={{ width: `${(perRoom[r.id] / maxRoom) * 100}%` }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                      style={{ background: `linear-gradient(90deg, ${color}66, ${color})` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h4 className="font-display font-semibold text-white">By category</h4>
          <div className="mt-3 flex flex-col gap-2">
            {Object.entries(CATEGORY_META).map(([key, meta]) => (
              <div key={key} className="flex items-center gap-3 text-sm">
                <span className="size-2.5 rounded-full" style={{ background: meta.color, boxShadow: `0 0 10px ${meta.color}` }} />
                <span className="text-slate-300">{meta.label}</span>
                <span className="ml-auto tabular-nums text-slate-400">{((breakdown[key] / total) * 100).toFixed(0)}%</span>
                <span className="w-16 text-right tabular-nums text-white">{breakdown[key].toFixed(2)} kW</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
