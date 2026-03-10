import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Slider from '@radix-ui/react-slider';
import { gsap } from 'gsap';
import useCarrierStore from '../../store/useCarrierStore';

const PRESETS = [
  {
    name: '🌧️ Monsoon Mode',
    weights: { cost: 10, reliability: 65, speed: 15, quality: 10 },
    desc: 'NH corridors 3× delay rate in monsoon season',
  },
  {
    name: '💰 Cost Crunch',
    weights: { cost: 70, reliability: 10, speed: 15, quality: 5 },
    desc: 'Management directive: minimize per-km cost this quarter',
  },
  {
    name: '🚀 Express Lane',
    weights: { cost: 15, reliability: 20, speed: 55, quality: 10 },
    desc: 'Time-critical: 24hr delivery window required',
  },
  {
    name: '⚖️ Balanced',
    weights: { cost: 35, reliability: 30, speed: 20, quality: 15 },
    desc: 'Standard procurement evaluation protocol',
  },
];

const FIELD_CONFIG = {
  cost: { icon: '💰', label: 'Cost', color: 'neon' },
  reliability: { icon: '✅', label: 'Reliability', color: 'ice' },
  speed: { icon: '⚡', label: 'Speed', color: '#a78bfa' },
  quality: { icon: '🌟', label: 'Quality', color: 'gold' },
};

export default function WhatIfPanel() {
  const weights = useCarrierStore((s) => s.weights);
  const isComputing = useCarrierStore((s) => s.isComputing);
  const computeMs = useCarrierStore((s) => s.computeTime);
  const updateWeight = useCarrierStore((s) => s.updateWeight);
  const applyPreset = useCarrierStore((s) => s.applyPreset);

  useEffect(() => {
    const ev = new CustomEvent('whatif-change', { detail: weights });
    window.dispatchEvent(ev);
  }, [weights]);

  const handleSliderChange = (field, value) => {
    updateWeight(field, value);
  };

  const handlePresetClick = (preset) => {
    Object.entries(preset.weights).forEach(([field, target]) => {
      const anim = { v: weights[field] };
      gsap.to(anim, {
        v: target,
        duration: 0.8,
        ease: 'elastic.out(1,0.3)',
        onUpdate: () => updateWeight(field, Math.round(anim.v)),
      });
    });
    applyPreset(preset.weights);
  };

  return (
    <motion.div
      className="glass-card w-[280px] p-6 flex flex-col space-y-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="text-[8px] font-mono tracking-wider uppercase">
        ⚡ WHAT-IF SIMULATOR
      </div>
      <div className="text-xs text-brand-dim">Organism reshapes in &lt;50ms</div>

      {Object.entries(FIELD_CONFIG).map(([field, cfg]) => (
        <div key={field} className="space-y-1">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="flex items-center space-x-1">
              <span>{cfg.icon}</span>
              <span>{cfg.label}</span>
            </span>
            <span>{weights[field]}%</span>
          </div>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-3"
            value={[weights[field]]}
            onValueChange={(val) => handleSliderChange(field, val[0])}
            min={0}
            max={100}
          >
            <Slider.Track className="bg-edge relative grow h-1 rounded-full">
              <Slider.Range
                className="h-full rounded-full"
                style={{
                  background:
                    field === 'cost'
                      ? 'linear-gradient(to right, #4f6ef7, #00f0ff)'
                      : field === 'reliability'
                      ? '#00f0ff'
                      : field === 'speed'
                      ? '#a78bfa'
                      : '#f5c118',
                }}
              />
            </Slider.Track>
            <Slider.Thumb className="block w-4 h-4 bg-white border-2 rounded-full shadow-lg focus:outline-none" />
          </Slider.Root>
        </div>
      ))}

      <div className="text-[10px] font-mono text-center">
        {isComputing
          ? 'Recomputing...'
          : computeMs > 0 && `Recomputed in ${computeMs}ms`}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            className="glass-card text-[10px] p-2 text-center flex items-center justify-center"
            onClick={() => handlePresetClick(p)}
            whileTap={{ scale: 0.95 }}
          >
            {p.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {computeMs > 0 && (
        <div className="text-[9px] font-mono text-brand-dim mt-2">
          {PRESETS.find((p) =>
            Object.entries(p.weights).every(
              ([f, v]) => weights[f] === v
            )
          )?.desc || ''}
        </div>
      )}
    </motion.div>
  );
}
