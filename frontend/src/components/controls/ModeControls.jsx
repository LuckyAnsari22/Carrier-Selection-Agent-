import React from 'react';
import { motion } from 'framer-motion';
import useCarrierStore from '../../store/useCarrierStore';

const MODES = [
  { key: 'normal', label: 'HEALTHY', icon: '🧬', color: '#00e87a' },
  { key: 'risk', label: 'RISK DECAY', icon: '☠️', color: '#ff1f6e' },
  { key: 'pulse', label: 'HEARTBEAT', icon: '💓', color: '#00f0ff' },
  { key: 'express', label: 'EXPRESS', icon: '🚀', color: '#4f6ef7' },
];

export default function ModeControls() {
  const networkMode = useCarrierStore((s) => s.networkMode);
  const previousMode = useCarrierStore((s) => s.previousMode);
  const bpm = useCarrierStore((s) => s.bpm);
  const setNetworkMode = useCarrierStore((s) => s.setNetworkMode);

  const statusLabel = () => {
    if (networkMode === 'normal') return 'HEALTHY';
    if (networkMode === 'risk') return 'DECAY';
    if (networkMode === 'pulse') return previousMode === 'risk' ? 'STRESSED' : 'HEALTHY';
    if (networkMode === 'express') return 'EXPRESS';
    return networkMode.toUpperCase();
  };

  return (
    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 flex flex-col items-center space-y-3">
      {MODES.map((m) => {
        const active = networkMode === m.key;
        return (
          <motion.div
            key={m.key}
            onClick={() => setNetworkMode(m.key)}
            className="glass-card w-[200px] p-3 flex items-center space-x-2 cursor-pointer"
            style={{
              border: active ? `2px solid ${m.color}` : '2px solid transparent',
              backgroundColor: active ? m.color + '22' : undefined,
            }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 10px rgba(0,0,0,0.3)' }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{m.icon}</span>
            <span className="font-mono text-sm">{m.label}</span>
          </motion.div>
        );
      })}

      <div className="text-xs font-mono mt-2 flex items-center space-x-1">
        <span>♥</span>
        <span>{bpm} BPM</span>
        <span>— NETWORK {statusLabel()}</span>
      </div>
    </div>
  );
}
