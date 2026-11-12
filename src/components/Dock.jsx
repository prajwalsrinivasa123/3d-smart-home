import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ChartColumn, Cuboid, Video, WandSparkles } from 'lucide-react'
import { useHomeStore } from '../store/useHomeStore'

export const VIEWS = [
  { id: 'floorplan', label: '3D Floorplan', icon: Cuboid, color: '#818CF8' },
  { id: 'energy', label: 'Energy Analytics', icon: ChartColumn, color: '#FFB347' },
  { id: 'security', label: 'Security Feeds', icon: Video, color: '#F472B6' },
  { id: 'automations', label: 'Automations', icon: WandSparkles, color: '#34D399' },
]

function DockItem({ item, mouseX, active, onSelect }) {
  const ref = useRef(null)
  const distance = useTransform(mouseX, (x) => {
    const rect = ref.current?.getBoundingClientRect()
    return rect ? x - (rect.left + rect.width / 2) : Infinity
  })
  const size = useSpring(useTransform(distance, [-140, 0, 140], [48, 68, 48]), { stiffness: 320, damping: 22, mass: 0.2 })
  const iconScale = useTransform(size, [48, 68], [1, 1.25])
  const Icon = item.icon

  return (
    <div className="group relative flex flex-col items-center">
      <span className="pointer-events-none absolute -top-10 rounded-lg border border-white/10 bg-[#0A0D14]/90 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-xl backdrop-blur-xl transition-all duration-200 group-hover:-translate-y-1 group-hover:opacity-100">
        {item.label}
      </span>
      <motion.button
        ref={ref}
        type="button"
        aria-label={item.label}
        aria-current={active ? 'page' : undefined}
        onClick={() => onSelect(item.id)}
        whileTap={{ scale: 0.88 }}
        style={{
          width: size,
          height: size,
          background: active ? `linear-gradient(145deg, ${item.color}55, ${item.color}18)` : 'rgba(255,255,255,0.06)',
          borderColor: active ? `${item.color}66` : 'rgba(255,255,255,0.08)',
          boxShadow: active ? `0 10px 30px -10px ${item.color}` : 'inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
        className="grid cursor-pointer place-items-center rounded-2xl border"
      >
        <motion.span style={{ scale: iconScale, color: active ? '#fff' : item.color }}>
          <Icon size={22} strokeWidth={1.9} />
        </motion.span>
      </motion.button>
      <motion.span
        className="mt-1.5 size-1 rounded-full"
        animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0 }}
        style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }}
      />
    </div>
  )
}

export function Dock() {
  const mouseX = useMotionValue(Infinity)
  const view = useHomeStore((s) => s.view)
  const setView = useHomeStore((s) => s.setView)

  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.4 }}
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      aria-label="Dashboard views"
      className="glass-highlight pointer-events-auto flex h-[84px] items-end gap-3 rounded-3xl border border-white/10 bg-white/5 px-3.5 pb-2 shadow-2xl backdrop-blur-xl backdrop-brightness-[0.38] backdrop-saturate-150"
    >
      {VIEWS.map((item, i) => (
        <div key={item.id} className="flex items-end gap-3">
          {i === 1 && <span className="mb-4 h-10 w-px self-center bg-white/10" />}
          <DockItem item={item} mouseX={mouseX} active={view === item.id} onSelect={setView} />
        </div>
      ))}
    </motion.nav>
  )
}
