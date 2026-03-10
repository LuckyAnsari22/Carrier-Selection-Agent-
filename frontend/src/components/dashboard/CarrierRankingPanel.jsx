import { motion, AnimatePresence } from 'framer-motion'
import useCarrierStore from '../../store/useCarrierStore'

const TIER_BADGES = {
  'Premium': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Standard': 'bg-blue-accent/10 text-blue-accent border-blue-accent/20',
  'Budget': 'bg-white/10 text-white/60 border-white/20'
}

export default function CarrierRankingPanel() {
  const { rankings, selectCarrier, selectedCarrier, isAnalyzing } = useCarrierStore()
  const carriers = rankings?.rankings || []

  return (
    <div className="glass-card p-6 min-h-[500px] flex flex-col relative overflow-hidden group">
      {/* Decorative background number */}
      <div className="absolute top-0 right-0 p-8 text-[120px] font-bold text-white/[0.02] pointer-events-none select-none leading-none">
        {carriers.length}
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Competitive Stack</h2>
          <p className="font-jetbrains-mono text-[9px] text-white/30 uppercase mt-1 tracking-widest">AHP + TOPSIS Decision Logic</p>
        </div>
        {isAnalyzing && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-glow/5 border border-green-glow/20 rounded-full">
            <div className="w-1 h-1 rounded-full bg-green-glow animate-ping" />
            <span className="text-[9px] text-green-glow font-bold uppercase tracking-tighter">Recalculating...</span>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-3 relative z-10 custom-scrollbar overflow-y-auto pr-2">
        <AnimatePresence mode="popLayout">
          {carriers.map((carrier, i) => {
            const isSelected = selectedCarrier?.carrier_id === carrier.carrier_id
            return (
              <motion.div
                key={carrier.carrier_id}
                layout
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05, type: 'spring', damping: 20 }}
                onClick={() => selectCarrier(carrier)}
                className={`
                  relative flex items-center p-4 rounded-xl cursor-pointer border transition-all duration-300
                  ${isSelected
                    ? 'bg-white/[0.04] border-green-glow/40 shadow-[0_0_20px_rgba(0,255,136,0.05)]'
                    : 'bg-white/[0.01] border-white/5 hover:border-white/20 hover:bg-white/[0.03]'
                  }
                `}
              >
                {/* Ranking Slot */}
                <div className="w-10 flex flex-col items-center justify-center border-r border-white/5 mr-4 py-1">
                  <span className="text-xs font-mono text-white/40 mb-1">{i + 1}</span>
                  <span className="text-xl leading-none">
                    {i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : '•'}
                  </span>
                </div>

                {/* Carrier Data Density */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="font-bold text-sm text-white truncate max-w-[140px]">{carrier.carrier_name || carrier.name}</span>
                    <span className={`text-[8px] px-2 py-0.5 rounded-full border font-mono uppercase font-bold ${TIER_BADGES[carrier.tier] || TIER_BADGES.Standard}`}>
                      {carrier.tier || 'Standard'}
                    </span>
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-white/30 uppercase font-mono">Performance</span>
                      <span className="text-[11px] font-bold text-green-glow">{(carrier.ontime_pct || carrier.otd_rate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-white/30 uppercase font-mono">Cost Index</span>
                      <span className="text-[11px] font-bold text-blue-accent">₹{(carrier.cost_per_km || carrier.price_per_kg).toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-white/30 uppercase font-mono">Delay</span>
                      <span className="text-[11px] font-bold text-orange-warn">{(carrier.avg_delay_hours || 0).toFixed(1)}h</span>
                    </div>
                  </div>
                </div>

                {/* Accuracy/Score visualization */}
                <div className="flex flex-col items-end gap-2 ml-4 min-w-[60px]">
                  <span className="text-[14px] font-mono font-black text-white px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                    {(carrier.score_pct || carrier.final_score * 100 || 0).toFixed(0)}
                  </span>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${carrier.score_pct || carrier.final_score * 100 || 0}%` }}
                      className={`h-full rounded-full ${i === 0 ? 'bg-green-glow' : i === 1 ? 'bg-blue-accent' : 'bg-orange-warn'}`}
                    />
                  </div>
                </div>

                {/* Anomaly Indicator overlay if needed */}
                {carrier.anomalous && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-critical animate-pulse" />
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {carriers.length === 0 && !isAnalyzing && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30">
            <span className="text-6xl mb-6 grayscale">📦</span>
            <p className="font-mono text-xs uppercase tracking-[0.3em]">No Decision Data Loaded</p>
            <p className="text-[11px] mt-4 max-w-xs leading-relaxed">Ensure backend connectivity and click 'Analyze' to populate rankings.</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center relative z-10">
        <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Enterprise Version 2026.4</span>
        <button className="text-[9px] font-mono text-blue-accent uppercase tracking-widest hover:underline underline-offset-4">Export Audit Log</button>
      </div>
    </div>
  )
}
