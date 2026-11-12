import { useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Flame, Leaf, Minus, Plus, Snowflake, Thermometer } from 'lucide-react'
import { HVAC_MODES, ROOMS } from '../data/rooms'
import { useHomeStore } from '../store/useHomeStore'
import { CardHeader, GlassCard } from './ui/GlassCard'

const MIN = 16
const MAX = 30
const SIZE = 220
const C = SIZE / 2
const R = 86
const SWEEP = 270
const START = 135 // SVG degrees (0 = 3 o'clock, clockwise) for the arc's start at the lower-left
const CIRC = 2 * Math.PI * R
const HVAC_ICONS = { cool: Snowflake, heat: Flame, eco: Leaf }

const polar = (deg, r = R) => {
  const rad = (deg * Math.PI) / 180
  return [C + r * Math.cos(rad), C + r * Math.sin(rad)]
}

export function ThermostatDial() {
  const { target, hvac } = useHomeStore((s) => s.thermostat)
  const acOn = useHomeStore((s) => s.devices.ac)
  const indoor = useHomeStore((s) => ROOMS.reduce((a, r) => a + s.rooms[r.id].temp, 0) / ROOMS.length)
  const setThermostat = useHomeStore((s) => s.setThermostat)
  const setHvac = useHomeStore((s) => s.setHvac)
  const svgRef = useRef(null)
  const lastFraction = useRef(0)

  const mode = HVAC_MODES[hvac]
  const accent = acOn ? mode.color : '#64748B'
  const fraction = (target - MIN) / (MAX - MIN)
  lastFraction.current = fraction
  const knobAngle = START + SWEEP * fraction
  const [kx, ky] = polar(knobAngle)

  const updateFromPointer = useCallback(
    (e) => {
      const rect = svgRef.current.getBoundingClientRect()
      const dx = e.clientX - (rect.left + rect.width / 2)
      const dy = e.clientY - (rect.top + rect.height / 2)
      // Angle from 12 o'clock, clockwise, in (-180, 180]
      const fromTop = (Math.atan2(dx, -dy) * 180) / Math.PI
      let f
      if (Math.abs(fromTop) > SWEEP / 2) f = lastFraction.current > 0.5 ? 1 : 0
      else f = (fromTop + SWEEP / 2) / SWEEP
      setThermostat(MIN + f * (MAX - MIN))
    },
    [setThermostat],
  )

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    updateFromPointer(e)
  }
  const onPointerMove = (e) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) updateFromPointer(e)
  }

  const delta = target - indoor
  const status = !acOn
    ? 'Climate off'
    : Math.abs(delta) < 0.3
      ? 'Holding temperature'
      : hvac === 'eco'
        ? `Eco · easing to ${target.toFixed(1)}°`
        : hvac === 'cool'
          ? delta < 0
            ? `Cooling to ${target.toFixed(1)}°`
            : 'Idle · below target'
          : delta > 0
            ? `Heating to ${target.toFixed(1)}°`
            : 'Idle · above target'

  return (
    <GlassCard delay={0.14} className="p-5">
      <CardHeader
        icon={Thermometer}
        title="Climate"
        subtitle={status}
        accent={accent}
        right={
          <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs whitespace-nowrap tabular-nums text-slate-300">
            Indoor {indoor.toFixed(1)}°
          </span>
        }
      />

      <div className="relative mx-auto mt-2 w-full max-w-[220px]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full cursor-grab touch-none rounded-full outline-none select-none focus-visible:ring-2 focus-visible:ring-white/30 active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          role="slider"
          aria-label="Target temperature"
          aria-valuemin={MIN}
          aria-valuemax={MAX}
          aria-valuenow={target}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowRight') setThermostat(target + 0.5)
            if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') setThermostat(target - 0.5)
          }}
        >
          <defs>
            <linearGradient id="dial-grad" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
              <stop offset="100%" stopColor={accent} />
            </linearGradient>
            <filter id="dial-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
            <radialGradient id="dial-face" cx="50%" cy="35%" r="65%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.01)" />
            </radialGradient>
          </defs>

          {Array.from({ length: 57 }, (_, i) => {
            const t = i / 56
            const angle = START + SWEEP * t
            const major = i % 4 === 0
            const [x1, y1] = polar(angle, R + 13)
            const [x2, y2] = polar(angle, R + (major ? 20 : 17))
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={t <= fraction ? accent : 'rgba(255,255,255,0.14)'}
                strokeOpacity={t <= fraction ? 0.9 : 1}
                strokeWidth={major ? 2 : 1.2}
                strokeLinecap="round"
              />
            )
          })}

          <circle cx={C} cy={C} r={R - 16} fill="url(#dial-face)" stroke="rgba(255,255,255,0.08)" />
          <circle
            cx={C}
            cy={C}
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(CIRC * SWEEP) / 360} ${CIRC}`}
            transform={`rotate(${START} ${C} ${C})`}
          />
          <circle
            cx={C}
            cy={C}
            r={R}
            fill="none"
            stroke={accent}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${((CIRC * SWEEP) / 360) * fraction} ${CIRC}`}
            transform={`rotate(${START} ${C} ${C})`}
            filter="url(#dial-glow)"
            opacity="0.75"
            style={{ transition: 'stroke-dasharray 0.25s ease, stroke 0.4s ease' }}
          />
          <circle
            cx={C}
            cy={C}
            r={R}
            fill="none"
            stroke="url(#dial-grad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${((CIRC * SWEEP) / 360) * fraction} ${CIRC}`}
            transform={`rotate(${START} ${C} ${C})`}
            style={{ transition: 'stroke-dasharray 0.25s ease' }}
          />
          <circle cx={kx} cy={ky} r="11" fill="#fff" style={{ filter: `drop-shadow(0 0 8px ${accent})` }} />
          <circle cx={kx} cy={ky} r="4" fill={accent} />
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            key={hvac}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-1"
            style={{ color: accent }}
          >
            {(() => {
              const Icon = HVAC_ICONS[hvac]
              return <Icon size={16} />
            })()}
          </motion.div>
          <div className="font-display text-[44px] leading-none font-semibold tabular-nums tracking-tight text-white">
            {target.toFixed(1)}
            <span className="align-top text-xl text-slate-400">°C</span>
          </div>
          <div className="mt-1 text-[11px] tracking-[0.14em] text-slate-500 uppercase">Target</div>
        </div>

        <button
          type="button"
          aria-label="Decrease temperature"
          onClick={() => setThermostat(target - 0.5)}
          className="absolute bottom-1 left-6 grid size-9 cursor-pointer place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white active:scale-90"
        >
          <Minus size={16} />
        </button>
        <button
          type="button"
          aria-label="Increase temperature"
          onClick={() => setThermostat(target + 0.5)}
          className="absolute right-6 bottom-1 grid size-9 cursor-pointer place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white active:scale-90"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-black/20 p-1">
        {Object.values(HVAC_MODES).map((m) => {
          const Icon = HVAC_ICONS[m.id]
          const active = hvac === m.id && acOn
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setHvac(m.id)}
              className={`relative flex cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium transition-colors ${
                active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="hvac-pill"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-xl border border-white/10"
                  style={{ background: `${m.color}26`, boxShadow: `0 0 20px -6px ${m.color}` }}
                />
              )}
              <Icon size={14} className="relative" style={{ color: active ? m.color : undefined }} />
              <span className="relative">{m.label}</span>
            </button>
          )
        })}
      </div>
    </GlassCard>
  )
}
