import { AnimatePresence, motion } from 'framer-motion'
import { AirVent, Bot, Cctv, LockKeyhole, LockKeyholeOpen, Cpu } from 'lucide-react'
import { HVAC_MODES } from '../data/rooms'
import { useHomeStore } from '../store/useHomeStore'
import { CardHeader, GlassCard } from './ui/GlassCard'

function DeviceTile({ icon: Icon, label, status, on, accent, onToggle, pulse }) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.93 }}
      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      className="relative flex cursor-pointer flex-col items-start gap-3 overflow-hidden rounded-2xl border p-3.5 text-left transition-colors duration-300"
      style={{
        borderColor: on ? `${accent}55` : 'rgba(255,255,255,0.06)',
        background: on ? `linear-gradient(145deg, ${accent}2e, ${accent}08)` : 'rgba(255,255,255,0.03)',
        boxShadow: on ? `0 10px 30px -14px ${accent}, inset 0 1px 0 rgba(255,255,255,0.08)` : 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <div className="flex w-full items-center justify-between">
        <span
          className="relative grid size-9 place-items-center rounded-xl transition-colors duration-300"
          style={{ background: on ? accent : 'rgba(255,255,255,0.06)', color: on ? '#0A0D14' : '#94A3B8' }}
        >
          {pulse && on && <span className="absolute inset-0 animate-ping rounded-xl opacity-30" style={{ background: accent }} />}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={String(on)}
              initial={{ scale: 0.4, rotate: -30, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.4, rotate: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="relative"
            >
              <Icon size={17} strokeWidth={2.2} />
            </motion.span>
          </AnimatePresence>
        </span>
        <span
          className="h-5 w-8 rounded-full p-0.5 transition-colors duration-300"
          style={{ background: on ? accent : 'rgba(255,255,255,0.1)' }}
        >
          <motion.span
            className="block size-4 rounded-full bg-white shadow"
            animate={{ x: on ? 12 : 0 }}
            transition={{ type: 'spring', stiffness: 600, damping: 30 }}
          />
        </span>
      </div>
      <div>
        <div className="text-sm font-semibold text-white">{label}</div>
        <div className="text-xs tabular-nums" style={{ color: on ? accent : '#64748B' }}>
          {status}
        </div>
      </div>
    </motion.button>
  )
}

export function DevicesGrid() {
  const devices = useHomeStore((s) => s.devices)
  const thermostat = useHomeStore((s) => s.thermostat)
  const toggleDevice = useHomeStore((s) => s.toggleDevice)
  const activeCount = Object.values(devices).filter(Boolean).length

  return (
    <GlassCard delay={0.3} className="p-5">
      <CardHeader
        icon={Cpu}
        title="Smart Devices"
        subtitle={`${activeCount} of 4 active`}
        accent="#34D399"
      />
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <DeviceTile
          icon={devices.lock ? LockKeyhole : LockKeyholeOpen}
          label="Smart Lock"
          status={devices.lock ? 'Locked' : 'Unlocked'}
          on={devices.lock}
          accent="#34D399"
          onToggle={() => toggleDevice('lock')}
        />
        <DeviceTile
          icon={AirVent}
          label="AC Unit"
          status={devices.ac ? `${HVAC_MODES[thermostat.hvac].label} · ${thermostat.target.toFixed(1)}°` : 'Off'}
          on={devices.ac}
          accent={HVAC_MODES[thermostat.hvac].color}
          onToggle={() => toggleDevice('ac')}
        />
        <DeviceTile
          icon={Bot}
          label="Robot Vacuum"
          status={devices.vacuum ? 'Cleaning · Living' : 'Docked · 100%'}
          on={devices.vacuum}
          accent="#22D3EE"
          pulse
          onToggle={() => toggleDevice('vacuum')}
        />
        <DeviceTile
          icon={Cctv}
          label="Cameras"
          status={devices.cameras ? 'Armed · 4 feeds' : 'Disarmed'}
          on={devices.cameras}
          accent="#F472B6"
          pulse
          onToggle={() => toggleDevice('cameras')}
        />
      </div>
    </GlassCard>
  )
}
