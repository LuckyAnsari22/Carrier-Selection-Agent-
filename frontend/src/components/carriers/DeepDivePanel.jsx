import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// mock shap values per carrier id
const MOCK_SHAP = {
  0: [
    { name: 'Cost/km', val: -0.23 },
    { name: 'On-time %', val: 0.19 },
    { name: 'Damage rate', val: -0.12 },
    { name: 'Capacity util', val: 0.08 },
    { name: 'Risk level', val: -0.05 },
  ],
  // ...other ids can be same or randomized
};

export default function DeepDivePanel({ carrier, verdict = 'AWARD', onClose }) {
  if (!carrier) return null;
  const shap = MOCK_SHAP[carrier.id] || MOCK_SHAP[0];

  // determine verdict color
  const verdictColor = verdict === 'AWARD' ? 'life' : verdict === 'WATCH' ? 'gold' : 'plasma';

  return (
    <AnimatePresence>
      {carrier && (
        <motion.div
          className="deep-dive-panel"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          <button className="close-btn" onClick={onClose}><X size={14} /></button>
          <div className="dd-header flex justify-between">
            <div>
              <div className="text-[8px] font-mono text-brand-dim">SELECTED CARRIER</div>
              <div className="font-bebas text-[28px] leading-tight">{carrier.name}</div>
              <div className="text-xs font-mono text-brand-dim">
                Rank #{carrier.rank} · {carrier.tier} · {carrier.ontime_pct}% on-time
              </div>
            </div>
            <div className="text-right">
              <div className="text-[8px] font-mono text-brand-dim">SCORE</div>
              <div className="font-mono text-[36px] text-ice glow-text">{(carrier.score*100).toFixed(0)}</div>
            </div>
          </div>

          <div className="shap-section mt-4">
            <div className="text-xs font-semibold mb-2">SCORE DRIVERS — SHAP EXPLAINABILITY</div>
            {shap.map((f, idx) => {
              const positive = f.val > 0;
              return (
                <motion.div
                  key={idx}
                  className="shap-row flex items-center mb-1"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: '100%' }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <div className="text-xs w-24 font-mono">{f.name}</div>
                  <div className="flex-1 mx-2 relative">
                    <div className={`shap-bar ${positive ? 'positive' : 'negative'}`} style={{ width: `${Math.abs(f.val)*100}%` }} />
                  </div>
                  <div className="text-xs font-mono">{positive ? '+' : '-'}{Math.abs(f.val).toFixed(2)}</div>
                </motion.div>
              );
            })}
          </div>

          <div className="verdict-card mt-4">
            <div className={`verdict-border verdict-${verdictColor}`} />
            <div className="p-3">
              <div className={`font-semibold text-${verdictColor}-400`}>VERDICT: {verdict}</div>
              <div className="text-xs font-mono text-brand-text mt-1">
                {verdict === 'AWARD' && 'Issuer may proceed with volume awards; capacity available.'}
                {verdict === 'WATCH' && 'Monitor closely; metrics trending to risk thresholds.'}
                {verdict === 'AVOID' && 'Avoid new contracts; carrier showing signs of decay.'}
              </div>
            </div>
          </div>

          <div className="agent-trail mt-4 text-xs font-mono flex items-center space-x-1">
            <span>Scored by:</span>
            <span className="pill">Risk Oracle</span>
            <span>→</span>
            <span className="pill">Decision Engine</span>
            <span>→</span>
            <span className="pill">Explainer</span>
            <span>→</span>
            <span className="pill">Audit Agent</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}