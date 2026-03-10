import { useState } from 'react'
import { motion } from 'framer-motion'
import useCarrierStore from '../../store/useCarrierStore'
import GlassCard from '../shared/GlassCard'

const SCENARIOS = [
  {
    id: 'baseline',
    name: 'Standard Baseline',
    icon: '⚖️',
    desc: 'Balanced risk/reward optimization.',
    weights: { cost: 40, reliability: 30, speed: 20, quality: 10 }
  },
  {
    id: 'emergency',
    name: 'Peak Season Speed',
    icon: '🚀',
    desc: 'Prioritize transit time & reliability over cost.',
    weights: { cost: 10, reliability: 50, speed: 30, quality: 10 }
  },
  {
    id: 'budget',
    name: 'Cost Containment',
    icon: '💸',
    desc: 'Max cost savings with minimum quality floor.',
    weights: { cost: 70, reliability: 10, speed: 10, quality: 10 }
  }
]

export default function WhatIfSimulator() {
  const { priorities, setPriorities } = useCarrierStore()
  const [activePreset, setActivePreset] = useState('baseline')

  const handleSlider = (key, val) => {
    setPriorities({ ...priorities, [key]: parseInt(val) })
    setActivePreset('custom')
  }

  const applyPreset = (preset) => {
    setPriorities(preset.weights)
    setActivePreset(preset.id)
  }

  return (
    <GlassCard className="p-6 relative overflow-hidden group">
      {/* Dynamic Background Glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-accent/5 blur-3xl rounded-full" />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-white">Scenario Modeler</h2>
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1">What-If Simulation Engine</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs">🧪</div>
      </div>

      {/* Preset Chips */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 custom-scrollbar">
        {SCENARIOS.map(s => (
          <button
            key={s.id}
            onClick={() => applyPreset(s)}
            className={`
              px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap
              ${activePreset === s.id ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'}
            `}
          >
            {s.icon} {s.name}
          </button>
        ))}
      </div>

      {/* Interactive Sliders */}
      <div className="space-y-6">
        {Object.entries(priorities).map(([key, val]) => (
          <div key={key} className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-black text-white/40 tracking-[0.2em]">{key} Weight</span>
              <span className="font-mono text-sm text-green-glow font-bold">{val}%</span>
            </div>
            <div className="relative group/slider h-6 flex items-center">
              {/* Custom Track */}
              <div className="absolute inset-x-0 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ width: `${val}%` }}
                  className="h-full bg-gradient-to-r from-blue-accent/50 to-green-glow/50"
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={val}
                onChange={(e) => handleSlider(key, e.target.value)}
                className="absolute inset-0 w-full bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.5)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5">
        <div className="p-3 bg-white/3 rounded-xl border border-white/5">
          <p className="text-[10px] text-white/50 leading-relaxed italic">
            "Adjusting weights will trigger an immediate recalculation of the <span className="text-white font-bold">TOPSIS</span> decision matrix across the current batch."
          </p>
        </div>
      </div>
    </GlassCard>
  )
}
