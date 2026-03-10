import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const carriers = [
  { id: 1, name: 'TransCo Premium', tier: 'Premium', score: 0.87, rank: 1, ontime: 97, cost: 42, risk: 'LOW', contributions: { ontime: 0.18, rating: 0.12, cost: -0.04, damage: 0.10 } },
  { id: 2, name: 'RaasLogistics', tier: 'Standard', score: 0.82, rank: 2, ontime: 93, cost: 38, risk: 'LOW', contributions: { ontime: 0.15, cost: -0.02 } },
  { id: 3, name: 'BlueDart Express', tier: 'Premium', score: 0.78, rank: 3, ontime: 89, cost: 46, risk: 'MEDIUM', contributions: { ontime: 0.12, cost: -0.03, damage: -0.05 } },
];

export default function SHAPWaterfall() {
  const [selected, setSelected] = useState(carriers[0].id);
  const carrier = carriers.find((c) => c.id === selected);

  const data = [];
  if (carrier) {
    let base = 0.5;
    data.push({ name: 'Base', value: base, type: 'base' });
    Object.entries(carrier.contributions).forEach(([k, v]) => {
      data.push({ name: k, value: v });
      base += v;
    });
    data.push({ name: 'Final', value: carrier.score - 0 });
  }

  // stagger animation state
  const [displayData, setDisplayData] = useState([]);
  useEffect(() => {
    setDisplayData([]);
    let idx = 0;
    const timer = setInterval(() => {
      if (idx < data.length) {
        setDisplayData((d) => [...d, data[idx]]);
        idx += 1;
      } else clearInterval(timer);
    }, 150);
    return () => clearInterval(timer);
  }, [selected]);

  const getBarColor = (entry) => {
    if (entry.type === 'base') return '#6366f1';
    if (entry.value >= 0) return '#22d3ee';
    return '#f43f5e';
  };

  const explanationText = carrier
    ? `${carrier.name} scored ${carrier.score.toFixed(2)} because:
✅ On-time delivery: contributed +18 to score (94% historical rate)
✅ Low damage rate: contributed +10 (0.3% vs 1.2% average)
⚠️ Cost: contributed −4 (Rs42/km, above network average)

VERDICT: AWARD — Strong all-round performer with proven reliability`
    : '';

  return (
    <div className="glass-card p-6 w-full">
      <div className="flex">
        <div className="w-2/5 pr-6">
          <select
            value={selected}
            onChange={(e) => setSelected(parseInt(e.target.value))}
            className="w-full bg-brand-card border border-brand-border text-brand-text p-2 mb-4"
          >
            {carriers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="text-5xl font-jetbrains-mono text-brand-primary mb-2">
            {carrier.score.toFixed(2)}
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs">#{carrier.rank} of {carriers.length}</span>
            <span className="text-xs" style={{ color: '#ffd700' }}>{carrier.tier.toUpperCase()}</span>
          </div>
          <div className="flex space-x-4 text-xs mb-4">
            <span>On-time: {carrier.ontime}%</span>
            <span>Cost: Rs{carrier.cost}/km</span>
            <span>Risk: {carrier.risk}</span>
          </div>
          <div className="glass-card border-l-4 border-brand-primary p-3 text-xs whitespace-pre-wrap">
            {explanationText}
          </div>
        </div>
        <div className="w-3/5">
          <div className="text-lg font-space-grotesk mb-2">SCORE DRIVERS — Why This Carrier Ranked #1</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={displayData} layout="vertical" barCategoryGap="20%">
              <XAxis type="number" domain={['dataMin', 'dataMax']} hide />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="value" isAnimationActive={false}>
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-around mt-4 text-xs">
            {Object.entries(carrier.contributions).slice(0,3).map(([k,v]) => (
              <div key={k} className="glass-card p-2">
                <div className="font-semibold">{k}</div>
                <div className="font-jetbrains-mono">{v>0?`+${(v*100).toFixed(0)}`:`${(v*100).toFixed(0)}`}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}