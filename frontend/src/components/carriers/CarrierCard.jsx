import React from 'react';
import { motion } from 'framer-motion';

// utility classes injected in index.css for animations
// props: carrier, selected, onClick, mode ('normal'|'risk'|'pulse'|'express')
export default function CarrierCard({ carrier, selected, onClick, mode }) {
  const { rank, tier, name, score, risk_level, ontime_pct, cost_per_km } = carrier;
  const riskColor = risk_level === 'HIGH' ? 'plasma' : risk_level === 'MEDIUM' ? 'gold' : 'life';
  const borderColor = risk_level === 'HIGH' ? 'bg-plasma' : risk_level === 'MEDIUM' ? 'bg-gold' : 'bg-life';
  const borderPulse = risk_level === 'HIGH' ? 'pulse-border-red' : risk_level === 'MEDIUM' ? 'pulse-border-gold' : 'pulse-border-green';

  return (
    <motion.div
      layoutId={`carrier-${carrier.id}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick && onClick(carrier)}
      className={`relative w-full bg-glass-card rounded-[14px] overflow-hidden cursor-pointer mb-3
        ${selected ? 'translate-x-1 shadow-lg' : 'hover:translate-x-1 hover:shadow-md'}
        transition-transform duration-200 ease-out
      `}
      style={{ borderLeftWidth: '3px' }}
    >
      {/* left colored border */}
      <div
        className={`${borderColor} absolute top-0 left-0 h-full`} 
        style={{ width: '3px' }}
      />
      {risk_level === 'HIGH' && mode === 'risk' && (
        <div className="risk-noise" />
      )}

      <div className="p-4 space-y-1">
        {/* line 1 */}
        <div className="text-xs font-mono text-brand-dim uppercase">
          Rank #{rank} · {tier}
        </div>
        {/* line 2 */}
        <div className="font-bebas text-[20px] tracking-wide text-brand-text">
          {name}
        </div>
        {/* line 3: score bar */}
        <div className="flex items-center space-x-2">
          <div className="font-mono text-[24px] text-ice">{(score*100).toFixed(0)}</div>
          <div className="flex-1 h-[2px] bg-gradient-to-r from-neon to-ice rounded" />
          <div className={`text-[10px] px-2 py-0.5 rounded-full text-void bg-${riskColor}-500 ${risk_level==='HIGH'?'pulse-risk':''}`}>
            {risk_level}
          </div>
        </div>
        {/* line 4: meta */}
        <div className="text-xs font-mono text-brand-dim">
          ⏱ {ontime_pct}% on-time · ₹{cost_per_km}/km
        </div>
      </div>
    </motion.div>
  );
}