import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';

const carriers = [
  { id: 1, name: 'TransCo Premium', tier: 'Premium', score: 0.87, rank: 1, ontime: 97, cost: 42, damage: 0.3, capacity: 0.65, contributions: { ontime: 0.18, rating: 0.12, cost: -0.04, damage: 0.10 } },
  { id: 2, name: 'RaasLogistics', tier: 'Standard', score: 0.82, rank: 2, ontime: 93, cost: 38, damage: 0.5, capacity: 0.72, contributions: { ontime: 0.15, cost: -0.02 } },
  { id: 3, name: 'BlueDart Express', tier: 'Premium', score: 0.78, rank: 3, ontime: 89, cost: 46, damage: 0.7, capacity: 0.88, contributions: { ontime: 0.12, cost: -0.03, damage: -0.05 } },
];

export default function Explain() {
  const [selected, setSelected] = useState(carriers[0].id);
  const [displayData, setDisplayData] = useState([]);
  const [scoreAnim, setScoreAnim] = useState(0);
  const [cfoBrief, setCfoBrief] = useState('');

  const carrier = carriers.find((c) => c.id === selected);

  useEffect(() => {
    if (!carrier) return;
    const data = [];
    let total = 0.5;
    data.push({ name: 'Base', value: total, type: 'base' });
    Object.entries(carrier.contributions).forEach(([k,v]) => {
      data.push({ name: k, value: v });
      total += v;
    });
    data.push({ name: 'Final', value: carrier.score - 0 });

    setDisplayData([]);
    data.forEach((d,i)=>{
      setTimeout(()=>{
        setDisplayData((arr)=>[...arr,d]);
      }, i*120);
    });

    setScoreAnim(0);
    let start = null;
    const dur = 600;
    const target = carrier.score;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts-start)/dur,1);
      setScoreAnim((target)*progress);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);

    setCfoBrief('Generating recommendation...');
    setTimeout(() => {
      setCfoBrief("TransCo Premium’s exceptional on-time record and low damage rate make it a prime candidate for volume awards. Although its cost per km is slightly above average, the operational reliability and capacity advantages justify continued partnership. Recommend securing long-term contracts while monitoring cost trends to maintain ROI.");
    }, 800);

  }, [selected]);

  const getBarColor = (entry) => {
    if (entry.type === 'base') return '#6366f1';
    if (entry.value >= 0) return 'url(#posGrad)';
    return '#ff1f6e';
  };

  return (
    <div className="w-full h-full p-6 flex">
      <div className="w-5/12 pr-6">
        <div className="glass-card p-6 space-y-4">
          <select
            value={selected}
            onChange={(e) => setSelected(parseInt(e.target.value))}
            className="w-full bg-[#0d0d20] border border-[#00f0ff] text-brand-text p-2 mb-4"
          >
            {carriers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="text-[64px] font-mono text-ice glow-text">
            <motion.span
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              key={scoreAnim}
            >
              {scoreAnim.toFixed(2)}
            </motion.span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs">#{carrier.rank} of {carriers.length}</span>
            <span className="text-xs text-gold">{carrier.tier.toUpperCase()}</span>
          </div>
          <div className="flex space-x-4 text-xs">
            <span>On-time: {carrier.ontime}%</span>
            <span>Cost: Rs{carrier.cost}/km</span>
            <span>Damage: {carrier.damage}%</span>
            <span>Capacity: {(carrier.capacity*100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
      <div className="w-7/12">
        <div className="glass-card p-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={displayData} layout="vertical" barCategoryGap="20%">
              <defs>
                <linearGradient id="posGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4f6ef7" />
                  <stop offset="100%" stopColor="#00f0ff" />
                </linearGradient>
              </defs>
              <XAxis type="number" domain={["dataMin","dataMax"]} hide />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="value" isAnimationActive={false}>
                {displayData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry)}
                    stroke={entry.name === 'Final' ? '#f5c118' : 'none'}
                    strokeWidth={entry.name === 'Final' ? 2 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="glass-card mt-4 p-4 text-xs font-mono">
            {cfoBrief}
          </div>
        </div>
      </div>
    </div>
  );
}
