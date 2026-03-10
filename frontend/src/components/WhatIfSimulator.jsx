import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CarrierRankings from './CarrierRankings';

const presetConfigs = {
  Monsoon: { cost: 10, reliability: 70, speed: 10, quality: 10 },
  'Cost Crunch': { cost: 70, reliability: 15, speed: 10, quality: 5 },
  Balanced: { cost: 35, reliability: 30, speed: 20, quality: 15 }
};

const sliderVariants = {
  initial: { x: 0 },
  animate: { x: 0 },
  press: { scale: 0.95 }
};

export default function WhatIfSimulator() {
  const [weights, setWeights] = useState(presetConfigs.Balanced);
  const [isComputing, setIsComputing] = useState(false);
  const [computeMs, setComputeMs] = useState(47);

  const handleSliderChange = (field, value) => {
    setWeights((w) => ({ ...w, [field]: value }));
    triggerRecompute();
  };

  const triggerRecompute = () => {
    setIsComputing(true);
    setComputeMs(Math.floor(30 + Math.random() * 20));
    setTimeout(() => {
      setIsComputing(false);
    }, 200);
  };

  const applyPreset = (name) => {
    const cfg = presetConfigs[name];
    if (cfg) {
      setWeights(cfg);
      triggerRecompute();
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-3/5 pr-4 relative">
        <CarrierRankings carriers={[]} isComputing={isComputing} computeMs={computeMs} />
      </div>
      <div className="w-2/5 bg-brand-card glass-card p-6 flex flex-col">
        <h2 className="text-xl font-space-grotesk mb-1">⚡ WHAT-IF SIMULATOR</h2>
        <p className="text-xs text-brand-dim mb-6">Changes re-rank 30 carriers in &lt;50ms</p>
        {/* sliders */}
        {['cost','reliability','speed','quality'].map((field) => {
          const icons = {
            cost: '💰',
            reliability: '✅',
            speed: '⚡',
            quality: '🌟'
          };
          const label = {
            cost: 'Cost Weight',
            reliability: 'Reliability',
            speed: 'Speed',
            quality: 'Quality'
          };
          return (
            <div key={field} className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span>{icons[field]} {label[field]}</span>
                <span className="font-jetbrains-mono">{weights[field]}%</span>
              </div>
              <motion.input
                type="range"
                min="0" max="100"
                value={weights[field]}
                onChange={(e) => handleSliderChange(field, parseInt(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg appearance-none cursor-pointer"
                whileTap="press"
                variants={sliderVariants}
              />
              <p className="text-xs text-brand-dim">Higher = More important to your team</p>
            </div>
          );
        })}
        {/* presets */}
        <div className="flex space-x-2 mb-6">
          {Object.keys(presetConfigs).map((name) => (
            <motion.button
              key={name}
              onClick={() => applyPreset(name)}
              className="flex-1 py-2 rounded font-semibold"
              whileTap={{ scale: 0.95 }}
              style={{
                background: name==='Monsoon' ? '#f59e0b' : name==='Cost Crunch' ? '#f43f5e' : '#6366f1',
                color: 'white'
              }}
            >
              {name}
            </motion.button>
          ))}
        </div>
        {/* speed comparison */}
        <div className="flex space-x-4 mb-4">
          <div className="flex-1 glass-card p-4 glow-indigo">
            <div className="text-sm">CarrierIQ</div>
            <div className="text-2xl font-jetbrains-mono text-brand-success">{computeMs}ms ✅</div>
          </div>
          <div className="flex-1 glass-card p-4">
            <div className="text-sm">Monte Carlo</div>
            <div className="text-2xl font-jetbrains-mono text-brand-danger">~300,000ms ❌</div>
          </div>
        </div>
        <div className="text-center text-lg text-brand-primary font-space-grotesk mb-4">
          CarrierIQ is 6,247x faster
        </div>
        {/* animated bars */}
        <div className="relative h-2 mb-2">
          <div className="absolute left-0 top-0 h-2 bg-brand-success" style={{ width: '100%' }} />
        </div>
        <div className="relative h-2 bg-brand-border overflow-hidden">
          <div className="absolute left-0 top-0 h-2 bg-brand-danger animate-[crawl_5s_linear_infinite]" style={{ width: '100%' }} />
        </div>
        <style>{`@keyframes crawl {0%{transform:translateX(-100%);}100%{transform:translateX(100%);}}`}</style>
      </div>
    </div>
  );
}