import { useEffect, useMemo } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { TrendingDown, TrendingUp, Zap } from 'lucide-react'
import { computePower, useHomeStore } from '../store/useHomeStore'
import { useShallow } from 'zustand/react/shallow'
import { CardHeader, GlassCard } from './ui/GlassCard'

const W = 300
const H = 96
const PAD = 6

export const CATEGORY_META = {
  climate: { label: 'Climate', color: '#38BDF8' },
  appliances: { label: 'Appliances', color: '#818CF8' },
  lighting: { label: 'Lighting', color: '#FFB347' },
  security: { label: 'Security', color: '#34D399' },
  base: { label: 'Standby', color: '#64748B' },
}

/** Catmull-Rom → cubic Bézier for a smooth line through every sample. */
export function smoothPath(points) {
  if (points.length < 2) return ''
  let d = `M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C ${c1[0].toFixed(2)} ${c1[1].toFixed(2)}, ${c2[0].toFixed(2)} ${c2[1].toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`
  }
  return d
}

export function AnimatedNumber({ value, decimals = 1, className }) {
  const spring = useSpring(value, { stiffness: 90, damping: 20 })
  const text = useTransform(spring, (v) => v.toFixed(decimals))
  useEffect(() => {
    spring.set(value)
  }, [spring, value])
  return <motion.span className={className}>{text}</motion.span>
}

export function usePower() {
  return useHomeStore(
    useShallow((s) => {
      const p = computePower(s)
      return { total: p.total, ...p.breakdown }
    }),
  )
}

export function EnergyChart() {
  const history = useHomeStore((s) => s.energyHistory)
  const energyToday = useHomeStore((s) => s.energyToday)
  const power = usePower()

  const { line, area, last, avg } = useMemo(() => {
    const data = history.length ? history : [power.total, power.total]
    const max = Math.max(...data, power.total) * 1.25
    const step = (W - PAD * 2) / (data.length - 1)
    const pts = data.map((v, i) => [PAD + i * step, H - PAD - (v / max) * (H - PAD * 2)])
    const l = smoothPath(pts)
    return {
      line: l,
      area: `${l} L ${pts[pts.length - 1][0]} ${H} L ${pts[0][0]} ${H} Z`,
      last: pts[pts.length - 1],
      avg: data.reduce((a, b) => a + b, 0) / data.length,
    }
  }, [history, power.total])

  const trend = ((power.total - avg) / avg) * 100
  const TrendIcon = trend >= 0 ? TrendingUp : TrendingDown

  return (
    <GlassCard delay={0.22} className="p-5">
      <CardHeader
        icon={Zap}
        title="Live Energy"
        subtitle="Real-time consumption"
        accent="#FFB347"
        right={
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium tabular-nums ${
              trend >= 0 ? 'bg-rose-400/10 text-rose-300' : 'bg-emerald-400/10 text-emerald-300'
            }`}
          >
            <TrendIcon size={12} />
            {Math.abs(trend).toFixed(1)}%
          </span>
        }
      />

      <div className="mt-4 flex items-baseline gap-2">
        <AnimatedNumber value={power.total} decimals={2} className="font-display text-4xl font-semibold tabular-nums tracking-tight text-white" />
        <span className="text-sm font-medium text-slate-400">kW</span>
        <span className="ml-auto text-xs tabular-nums text-slate-500">
          Today <span className="text-slate-300">{energyToday.toFixed(1)} kWh</span>
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-24 w-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="energy-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFB347" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#F472B6" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="energy-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="60%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#FFB347" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((t) => (
          <line key={t} x1="0" x2={W} y1={H * t} y2={H * t} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 5" />
        ))}
        <motion.path d={area} animate={{ d: area }} transition={{ duration: 0.8, ease: 'easeOut' }} fill="url(#energy-fill)" />
        <motion.path
          d={line}
          animate={{ d: line }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          fill="none"
          stroke="url(#energy-line)"
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <motion.circle animate={{ cx: last[0], cy: last[1] }} transition={{ duration: 0.8, ease: 'easeOut' }} r="9" fill="#FFB347" opacity="0.2">
          <animate attributeName="r" values="5;11;5" dur="2s" repeatCount="indefinite" />
        </motion.circle>
        <motion.circle animate={{ cx: last[0], cy: last[1] }} transition={{ duration: 0.8, ease: 'easeOut' }} r="4" fill="#FFB347" />
      </svg>

      <div className="mt-4 flex h-2 w-full gap-0.5 overflow-hidden rounded-full">
        {Object.entries(CATEGORY_META).map(([key, meta]) => (
          <motion.div
            key={key}
            className="h-full first:rounded-l-full last:rounded-r-full"
            animate={{ flexGrow: Math.max(power[key], 0.001) }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            style={{ background: meta.color, flexBasis: 0 }}
          />
        ))}
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-x-2 gap-y-1">
        {Object.entries(CATEGORY_META)
          .slice(0, 3)
          .map(([key, meta]) => (
            <div key={key} className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="size-1.5 rounded-full" style={{ background: meta.color }} />
              {meta.label}
              <span className="ml-auto tabular-nums text-slate-300">{power[key].toFixed(2)}</span>
            </div>
          ))}
      </div>
    </GlassCard>
  )
}
