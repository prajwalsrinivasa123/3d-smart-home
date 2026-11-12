import { Html } from '@react-three/drei'
import { Lightbulb, Thermometer } from 'lucide-react'
import { ROOMS, roomCenter, LIGHT_PRESETS } from '../../data/rooms'
import { activeDeviceCount, useHomeStore } from '../../store/useHomeStore'

function RoomPin({ room, portal }) {
  const [cx, cz] = roomCenter(room)
  const state = useHomeStore((s) => s.rooms[room.id])
  const focused = useHomeStore((s) => s.focus === room.id)
  const hovered = useHomeStore((s) => s.hoveredRoom === room.id)
  const setFocus = useHomeStore((s) => s.setFocus)
  const color = LIGHT_PRESETS[state.preset].color
  const devices = activeDeviceCount(state)
  const Icon = room.icon

  return (
    <Html position={[cx, 1.1, cz]} portal={portal} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div className="flex -translate-x-1/2 -translate-y-full flex-col items-center pb-px select-none">
        <button
          type="button"
          onClick={() => setFocus(room.id)}
          style={{ pointerEvents: 'auto' }}
          className={`group flex origin-bottom scale-[0.8] items-center gap-2.5 whitespace-nowrap rounded-2xl border py-1.5 pl-1.5 pr-3 backdrop-blur-xl transition-all duration-300 lg:scale-100 ${
            focused || hovered
              ? 'border-indigo-300/40 bg-indigo-500/20 shadow-[0_0_30px_-4px_rgba(129,140,248,0.6)]'
              : 'border-white/10 bg-[#0A0D14]/55 shadow-2xl hover:border-white/25'
          }`}
        >
          <span
            className="grid size-7 place-items-center rounded-xl transition-colors"
            style={{
              background: state.on ? `${color}33` : 'rgba(255,255,255,0.06)',
              color: state.on ? color : '#94A3B8',
              boxShadow: state.on ? `0 0 16px -2px ${color}` : 'none',
            }}
          >
            <Icon size={14} strokeWidth={2.2} />
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">{room.short}</span>
            <span className="flex items-center gap-2 text-[13px] font-semibold text-white tabular-nums">
              <span className="flex items-center gap-0.5">
                <Thermometer size={11} className="text-sky-300" />
                {state.temp.toFixed(1)}°C
              </span>
              <span className="flex items-center gap-0.5 text-slate-300">
                <Lightbulb size={11} className={state.on ? 'text-amber-300' : 'text-slate-500'} />
                {devices}
              </span>
            </span>
          </span>
        </button>
        <span className="h-12 w-px bg-gradient-to-b from-white/60 to-white/10" />
        <span
          className="size-2 translate-y-1/2 rounded-full ring-2 ring-white/20"
          style={{ background: state.on ? color : '#64748B', boxShadow: state.on ? `0 0 10px ${color}` : 'none' }}
        />
      </div>
    </Html>
  )
}

export function RoomPins({ portal }) {
  return ROOMS.map((room) => <RoomPin key={room.id} room={room} portal={portal} />)
}
