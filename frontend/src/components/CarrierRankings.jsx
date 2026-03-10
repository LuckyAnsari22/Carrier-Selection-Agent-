import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';
import useCarrierStore from '../../store/useCarrierStore';


const tierColors = {
  Premium: 'text-yellow-400',
  Standard: 'text-blue-400',
  Budget: 'text-gray-400'
};

const riskColors = {
  HIGH: 'bg-brand-danger text-brand-danger',
  MEDIUM: 'bg-brand-warning text-brand-warning',
  LOW: 'bg-brand-success text-brand-success'
};

export default function CarrierRankings() {
  const carriers = useCarrierStore((s) => s.carriers);
  const isComputing = useCarrierStore((s) => s.isComputing);
  const computeMs = useCarrierStore((s) => s.computeTime);
  // stagger animation refs
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 } })
  };

  return (
    <div className="w-full">
      {/* top stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="glass-card glow-indigo p-4">
          <div className="text-sm">Top Carrier</div>
          <div className="text-lg font-space-grotesk">TransCo Premium</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-sm">Score</div>
          <div className="text-3xl font-jetbrains-mono">0.87</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-sm">Computed in</div>
          <div className="text-2xl" style={{ color: '#22d3ee' }}>{computeMs}ms</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-sm">vs Monte Carlo</div>
          <div className="text-2xl flex">
            <span className="text-brand-success">6,000x</span>
            <span className="text-brand-danger ml-1">Faster</span>
          </div>
        </div>
      </div>

      {/* shimmer when recomputing */}
      {isComputing && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-secondary/20 to-transparent animate-pulse"></div>
      )}

      {/* carriers table */}
      <div className="overflow-x-auto relative">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-brand-dim">
              <th className="py-2">RANK</th>
              <th>CARRIER</th>
              <th>SCORE</th>
              <th>ON-TIME</th>
              <th>COST</th>
              <th>RISK</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {carriers.map((c, idx) => (
                <motion.tr
                  key={c.rank}
                  custom={idx}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  className="hover:border-l-4 hover:border-brand-primary hover:bg-brand-border transition-shadow"
                >
                  <td className={`${c.rank === 1 ? 'text-brand-primary font-bold' : 'text-brand-dim'} py-2`}>{c.rank}</td>
                  <td className="flex items-center space-x-2">
                    <span>{c.name}</span>
                    <span className={`${tierColors[c.tier]} text-xs`}>{c.tier}</span>
                  </td>
                  <td className="w-32">
                    <div className="relative bg-brand-border h-2 rounded">
                      <div
                        className="h-2 rounded bg-brand-primary"
                        style={{ width: `${c.score * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="flex items-center">
                    {c.ontime_pct}%
                    {c.ontime_pct > 90 ? <ArrowUp className="w-4 h-4 text-green-400 ml-1"/> : <ArrowDown className="w-4 h-4 text-red-400 ml-1"/>}
                  </td>
                  <td className="font-jetbrains-mono">Rs {c.cost_per_km}</td>
                  <td>
                    <span className={`px-2 py-1 text-xs rounded-full ${riskColors[c.risk_level]}`}>{c.risk_level}</span>
                  </td>
                  <td>
                    <button className="px-3 py-1 bg-brand-primary rounded hover:shadow-lg transition-shadow">
                      Select
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <div className="text-center text-xs text-brand-dim mt-4">
        Ranked using AHP-TOPSIS + XGBoost Risk Oracle | 7 Agents | LangGraph Orchestration
      </div>
    </div>
  );
}
