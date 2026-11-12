import { AnimatePresence, motion } from 'framer-motion'
import { Lightbulb, Plug, Sparkles, SunDim } from 'lucide-react'
import { LIGHT_PRESETS, OVERVIEW, ROOMS, ROOM_MAP } from '../data/rooms'
import { activeDeviceCount, useHomeStore } from '../store/useHomeStore'
import { CardHeader, GlassCard, Toggle } from './ui/GlassCard'

const PRESET_GRADIENTS = {
  warm: 'radial-gradient(circle at 30% 30%, #FFE0A8, #FFB347 55%, #C2410C)',
  daylight: 'radial-gradient(circle at 30% 30%, #FFFFFF, #E0F2FE 50%, #7DD3FC)',
  sunset: 'radial-gradient(circle at 30% 30%, #FFD1B8, #FF7A59 50%, #BE185D)',
  cyberpunk: 'radial-gradient(circle at 30% 30%, #E0E7FF, #818CF8 45%, #C026D3)',
}

export function RoomSwitcher() {
  const focus = useHomeStore((s) => s.focus)
  const setFocus = useHomeStore((s) => s.setFocus)
  const rooms = useHomeStore((s) => s.rooms)
  const items = [OVERVIEW, ...ROOMS]

  return (
    <GlassCard delay={0.1} className="p-2">
      <div className="grid grid-cols-5 gap-1 lg:grid-cols-1">
        {items.map((item) => {
          const Icon = item.icon
          const active = focus === item.id
          const roomState = rooms[item.id]
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFocus(item.id)}
              className={`group relative flex cursor-pointer flex-col items-center gap-1 rounded-2xl px-2 py-2.5 text-xs font-medium transition-colors lg:flex-row lg:gap-3 lg:px-3 lg:text-sm ${
                active ? 'text-white' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="room-pill"
                  transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  className="absolute inset-0 rounded-2xl border border-indigo-300/25 bg-gradient-to-r from-indigo-500/25 to-indigo-500/5 shadow-[0_0_30px_-10px_#818CF8]"
                />
              )}
              <span
                className={`relative grid size-8 place-items-center rounded-xl transition-colors ${
                  active ? 'bg-indigo-400/20 text-indigo-200' : 'bg-white/5 text-slate-400 group-hover:text-slate-200'
                }`}
              >
                <Icon size={16} />
              </span>
              <span className="relative max-w-full truncate text-[11px] lg:hidden">{item.short}</span>
              <span className="relative hidden truncate lg:inline">{item.id === 'overview' ? 'Overview' : item.name.split(' & ')[0]}</span>
              {roomState && (
                <span className="relative ml-auto hidden items-center gap-1.5 text-xs tabular-nums text-slate-500 lg:flex">
                  {roomState.temp.toFixed(1)}°
                  <span
                    className="size-1.5 rounded-full"
                    style={{
                      background: roomState.on ? LIGHT_PRESETS[roomState.preset].color : '#334155',
                      boxShadow: roomState.on ? `0 0 8px ${LIGHT_PRESETS[roomState.preset].color}` : 'none',
                    }}
                  />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </GlassCard>
  )
}

export function LightingCard() {
  const focus = useHomeStore((s) => s.focus)
  const rooms = useHomeStore((s) => s.rooms)
  const setRoomLight = useHomeStore((s) => s.setRoomLight)

  const ids = focus === 'overview' ? ROOMS.map((r) => r.id) : [focus]
  const states = ids.map((id) => rooms[id])
  const on = states.some((r) => r.on)
  const brightness = Math.round(states.reduce((a, r) => a + r.brightness, 0) / states.length)
  const preset = states.every((r) => r.preset === states[0].preset) ? states[0].preset : null
  const accent = LIGHT_PRESETS[preset ?? 'warm'].color
  const apply = (patch) => ids.forEach((id) => setRoomLight(id, patch))
  const title = focus === 'overview' ? 'All Lights' : `${ROOM_MAP[focus].short} Lights`

  return (
    <GlassCard delay={0.18} className="p-5">
      <CardHeader
        icon={Lightbulb}
        title={title}
        subtitle={on ? `${LIGHT_PRESETS[preset ?? 'warm'].kelvin} · ${preset ? LIGHT_PRESETS[preset].label : 'Mixed'}` : 'Lights off'}
        accent={on ? accent : '#64748B'}
        right={<Toggle checked={on} onChange={(v) => apply({ on: v })} accent={accent} label="Toggle lights" />}
      />

      <div className="mt-5 flex items-end justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <SunDim size={16} /> Brightness
        </div>
        <div className="font-display text-3xl font-semibold tabular-nums tracking-tight text-white">
          {brightness}
          <span className="text-base text-slate-500">%</span>
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={brightness}
        disabled={!on}
        onChange={(e) => apply({ brightness: Number(e.target.value) })}
        className="lumen-range mt-3"
        style={{ '--fill': `${brightness}%`, '--accent': accent }}
        aria-label="Brightness"
      />

      <div className="mt-5 mb-2 flex items-center gap-2 text-sm text-slate-400">
        <Sparkles size={15} /> Color scene
      </div>
      <div className="grid grid-cols-4 gap-2">
        {Object.values(LIGHT_PRESETS).map((p) => {
          const active = preset === p.id
          return (
            <motion.button
              key={p.id}
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => apply({ preset: p.id, on: true })}
              className={`relative flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border py-2.5 text-[11px] font-medium transition-colors ${
                active ? 'border-white/25 bg-white/10 text-white' : 'border-white/5 bg-white/[0.03] text-slate-400 hover:text-slate-200'
              }`}
            >
              <span
                className="size-7 rounded-full"
                style={{ background: PRESET_GRADIENTS[p.id], boxShadow: active ? `0 0 18px -1px ${p.color}` : 'none' }}
              />
              {p.label}
            </motion.button>
          )
        })}
      </div>
    </GlassCard>
  )
}

export function RoomDevicesCard() {
  const focus = useHomeStore((s) => s.focus)
  const rooms = useHomeStore((s) => s.rooms)
  const toggleRoomDevice = useHomeStore((s) => s.toggleRoomDevice)
  const setFocus = useHomeStore((s) => s.setFocus)
  const room = ROOM_MAP[focus]

  return (
    <GlassCard delay={0.26} className="p-5">
      <CardHeader
        icon={Plug}
        title={room ? 'In this room' : 'Rooms at a glance'}
        subtitle={room ? room.name : `${ROOMS.reduce((a, r) => a + activeDeviceCount(rooms[r.id]), 0)} devices active`}
        accent="#22D3EE"
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={focus}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-4 grid grid-cols-2 gap-2"
        >
          {room
            ? room.devices.map((d) => {
                const on = rooms[room.id].devices[d.id]
                return (
                  <motion.button
                    key={d.id}
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    onClick={() => toggleRoomDevice(room.id, d.id)}
                    className={`flex cursor-pointer flex-col items-start rounded-2xl border p-3 text-left transition-colors ${
                      on ? 'border-cyan-300/25 bg-cyan-400/10' : 'border-white/5 bg-white/[0.03] hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className={`text-sm font-medium ${on ? 'text-white' : 'text-slate-300'}`}>{d.label}</span>
                    <span className="mt-0.5 text-xs tabular-nums text-slate-500">
                      {on ? `${(d.kw * 1000).toFixed(0)} W` : 'Off'}
                    </span>
                  </motion.button>
                )
              })
            : ROOMS.map((r) => {
                const s = rooms[r.id]
                const Icon = r.icon
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setFocus(r.id)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-2xl border border-white/5 bg-white/[0.03] p-2.5 text-left transition-colors hover:bg-white/[0.07]"
                  >
                    <span
                      className="grid size-8 shrink-0 place-items-center rounded-xl"
                      style={{
                        background: s.on ? `${LIGHT_PRESETS[s.preset].color}26` : 'rgba(255,255,255,0.05)',
                        color: s.on ? LIGHT_PRESETS[s.preset].color : '#64748B',
                      }}
                    >
                      <Icon size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-200">{r.short}</span>
                      <span className="block text-xs tabular-nums text-slate-500">
                        {activeDeviceCount(s)} on · {s.temp.toFixed(1)}°
                      </span>
                    </span>
                  </button>
                )
              })}
        </motion.div>
      </AnimatePresence>
    </GlassCard>
  )
}

export function LeftPanel() {
  return (
    <div className="pointer-events-auto flex w-full flex-col gap-3 lg:w-[300px]">
      <RoomSwitcher />
      <LightingCard />
      <RoomDevicesCard />
    </div>
  )
}
