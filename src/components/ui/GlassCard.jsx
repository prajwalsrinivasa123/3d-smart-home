import { motion } from 'framer-motion'

const base =
  'glass-highlight rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl backdrop-brightness-[0.38] backdrop-saturate-150'

/** Liquid-glass surface with entrance animation and a subtle hover lift. */
export function GlassCard({ as = 'div', className = '', delay = 0, hover = true, children, ...props }) {
  const Comp = motion[as]
  return (
    <Comp
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 140, damping: 20, delay }}
      whileHover={hover ? { y: -2, borderColor: 'rgba(255,255,255,0.18)' } : undefined}
      className={`${base} ${className}`}
      {...props}
    >
      {children}
    </Comp>
  )
}

export function CardHeader({ icon: Icon, title, subtitle, accent = '#818CF8', right }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <span
            className="grid size-9 shrink-0 place-items-center rounded-2xl border border-white/10"
            style={{ background: `${accent}1f`, color: accent, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08)` }}
          >
            <Icon size={17} strokeWidth={2} />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="truncate font-display text-[15px] font-semibold tracking-tight text-white">{title}</h3>
          {subtitle && <p className="truncate text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  )
}

export function Toggle({ checked, onChange, accent = '#818CF8', label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative h-7 w-12 shrink-0 cursor-pointer rounded-full border border-white/10 transition-colors duration-300"
      style={{ background: checked ? accent : 'rgba(255,255,255,0.08)', boxShadow: checked ? `0 0 20px -4px ${accent}` : 'none' }}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 600, damping: 32 }}
        className="absolute top-0.5 size-[22px] rounded-full bg-white shadow-md"
        style={{ left: checked ? 'calc(100% - 24px)' : '2px' }}
      />
    </button>
  )
}
