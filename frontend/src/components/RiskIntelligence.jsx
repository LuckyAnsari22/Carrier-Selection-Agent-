import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock, Network, WarningIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import useCarrierStore from '../store/useCarrierStore';

// mock data
const summary = [
  { label: 'Overextended', value: 8, color: 'rose', icon: WarningIcon },
  { label: 'High Damage', value: 3, color: 'warning', icon: AlertCircle },
  { label: 'Delay Prone', value: 5, color: 'orange', icon: Clock },
  { label: 'Network: 47% Concentrated', value: null, color: 'purple', icon: Network }
];

const carriers = [...Array(15).keys()].map(i => ({ id: i, name: `Carrier ${i + 1}` }));
const dimensions = ['Capacity', 'Damage', 'Delay', 'Concentration'];

// random risk value generator
const genRisk = () => parseFloat(Math.random().toFixed(2));

export default function RiskIntelligence() {
  const [matrix, setMatrix] = useState([]);
  const [briefingText, setBriefingText] = useState('');
  const [counters, setCounters] = useState(summary.map(s => 0));

  useEffect(() => {
    // create risk matrix
    setMatrix(
      carriers.map(() => dimensions.map(() => genRisk()))
    );

    // animate counters
    summary.forEach((card, i) => {
      const target = card.value || 0;
      let v = 0;
      const step = () => {
        v += Math.ceil(target / 20);
        if (v >= target) v = target;
        setCounters(arr => { const copy = [...arr]; copy[i] = v; return copy; });
        if (v < target) requestAnimationFrame(step);
      };
      step();
    });

    // typewriter briefing
    const full = `RISK SHIELD AGENT — LIVE ANALYSIS\nAnalyzing 30 carriers across 4 risk dimensions...\n🚨 CRITICAL: BlueDart at 88% capacity — avoid volume awards\n⚠️ WATCH: TransCo C damage rate trending +20% YoY  \n⚠️ WATCH: Top 3 carriers = 47% network exposure\n✅ CLEAR: 18 carriers fully available for awards`;
    let idx = 0;
    const interval = setInterval(() => {
      setBriefingText(full.slice(0, idx));
      idx += 1;
      if (idx > full.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 space-y-6 text-brand-text">
      {/* summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {summary.map((card, idx) => {
          const Icon = card.icon;
          const pulse = card.value > 3 && card.label === 'Overextended' ? 'pulse-active' : '';
          return (
            <div
              key={idx}
              className={`glass-card p-4 flex items-center space-x-3 border-${card.color}-500 ${pulse}`}
            >
              <Icon className={`w-6 h-6 text-${card.color}-400`} />
              <div className="text-sm">
                <div className="font-bold">{counters[idx] ?? ''}</div>
                <div className="text-xs">{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* heatmap */}
      <div>
        <div className="text-xs font-semibold mb-2">
          CARRIER RISK MATRIX — {carriers.length} Carriers × {dimensions.length} Dimensions
        </div>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${dimensions.length + 1}, auto)` }}>
          <div />
          {dimensions.map((d, i) => (
            <div key={i} className="text-xs font-medium px-2 py-1">{d}</div>
          ))}
          {carriers.map((c, i) => (
            <React.Fragment key={c.id}>
              <div className="text-xs px-2 py-1">{c.name}</div>
              {matrix[i] && matrix[i].map((val, j) => {
                let bg = 'bg-green-800';
                if (val >= 0.6) bg = 'bg-rose-700';
                else if (val >= 0.3) bg = 'bg-amber-600';
                return (
                  <motion.div
                    key={j}
                    className={`${bg} w-6 h-6 m-1 cursor-pointer`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: j * 0.05 + i * 0.03 }}
                    title={`${(val * 100).toFixed(0)}%`}
                    onMouseEnter={() => {
                      if (val >= 0.6) useCarrierStore.getState().setHoveredCarrier(c.id);
                    }}
                    onMouseLeave={() => useCarrierStore.getState().clearHoveredCarrier()}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* briefing + feed */}
      <div className="flex space-x-4">
        <div className="w-3/5 glass-card p-4">
          <div className="font-bold mb-2">RISK SHIELD AGENT — LIVE ANALYSIS</div>
          <pre className="text-xs font-mono whitespace-pre-wrap bg-black text-green-300 p-2 rounded">{briefingText}</pre>
        </div>
        <div className="w-2/5 glass-card p-4">
          <div className="font-bold mb-2">Real-Time Intelligence</div>
          {['🔴 ALERT: NH-48 traffic disruption reported — affects 3 carriers',
            '🟡 UPDATE: Diesel prices up 3.2% — expect cost revisions',
            '🟢 CLEAR: Mumbai port operations normal'].map((item, idx) => {
            const border = item.startsWith('🔴') ? 'border-rose-500' : item.startsWith('🟡') ? 'border-amber-500' : 'border-green-500';
            return (
              <motion.div
                key={idx}
                className={`text-xs mb-1 pl-2 border-l-4 ${border}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.3 }}
              >
                {item} <span className="text-gray-500 text-[10px]">{new Date().toLocaleTimeString()}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
