import GlassCard from '../shared/GlassCard'
import { motion, AnimatePresence } from 'framer-motion'
import useCarrierStore from '../../store/useCarrierStore'

export default function AnomalyAlert() {
  const { rankings, isAnalyzing } = useCarrierStore()

  // Find any carrier with anomalous flag in rankings
  const anomaly = rankings?.rankings?.find(c => c.anomalous)

  return (
    <AnimatePresence>
      {(anomaly || isAnalyzing) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <GlassCard className="p-5 border-red-critical/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
              <span className="text-4xl">🚨</span>
            </div>

            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-orange-warn' : 'bg-red-critical'} animate-pulse`} />
              <h2 className={`font-bold ${isAnalyzing ? 'text-orange-warn' : 'text-red-critical'} text-sm uppercase tracking-widest`}>
                {isAnalyzing ? 'Anomaly Scanning...' : 'High Risk Detected'}
              </h2>
            </div>

            {isAnalyzing ? (
              <p className="text-[11px] text-white/50 leading-relaxed font-mono">
                Running isolation forest against historical baseline for {rankings?.carriers?.length || 15} bids...
              </p>
            ) : anomaly ? (
              <>
                <p className="text-[11px] text-white/80 leading-relaxed font-mono">
                  Market divergence in lane <span className="text-red-critical font-bold">MUM-DEL</span>.
                  Carrier <span className="text-white font-bold">{anomaly.name}</span> bid is
                  <span className="text-red-critical font-bold"> 18.3% below </span>
                  the 90-day moving average.
                </p>
                <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                  <button className="flex-1 bg-red-critical/20 hover:bg-red-critical/30 border border-red-critical/40 py-1.5 rounded-lg text-[10px] uppercase font-bold text-red-critical transition-all">
                    Flag for Review
                  </button>
                  <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-1.5 rounded-lg text-[10px] uppercase font-bold text-white/60 transition-all">
                    Dismiss
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-20">
                <p className="text-[10px] text-white/20 uppercase font-mono tracking-widest">No anomalies detected in current batch.</p>
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
