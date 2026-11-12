import { ThermostatDial } from './ThermostatDial'
import { EnergyChart } from './EnergyChart'
import { DevicesGrid } from './DevicesGrid'

export function RightPanel() {
  return (
    <div className="pointer-events-auto flex w-full flex-col gap-3 lg:w-[320px]">
      <ThermostatDial />
      <EnergyChart />
      <DevicesGrid />
    </div>
  )
}
