import GlassCard from '../shared/GlassCard'
import { motion, AnimatePresence } from 'framer-motion'
import useCarrierStore from '../../store/useCarrierStore'

export default function LiveRiskBriefing() {
  const { isAnalyzing } = useCarrierStore()

  // Simulated live research briefings (real app would fetch this from backend/api/routes/research.py)
  const briefings = [
    { title: 'Weather Alert', type: 'warn', content: 'Monsoon expected in Mumbai region next week. Expected transit variance: +15%.', icon: '⛈️' },
    { title: 'Fuel Index', type: 'info', content: 'Crude oil surge in Singapore market. Surcharge adjustments pending for air-heavy carriers.', icon: '⛽' },
    { title: 'Infrastructure', type: 'success', content: 'Delhi hub capacity upgraded to 150k T/day. Congestion risk reduced to LOW.', icon: '🏢' }
  ]

  return (
    <GlassCard className="p-5 h-full relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white">Live Intelligence Briefing</h2>
        <span className="text-[9px] font-mono text-white/30 tracking-widest uppercase">Exa Search Feed</span>
      </div>

      <div className="space-y-3">
        {briefings.map((brief, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 + i * 0.1 }}
            className={`
              p-3 rounded-xl border border-white/5 bg-white/3 group hover:bg-white/5 transition-all
              ${brief.type === 'warn' ? 'border-orange-warn/20 bg-orange-warn/5' : ''}
              ${brief.type === 'error' ? 'border-red-critical/20 bg-red-critical/5' : ''}
            `}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs">{brief.icon}</span>
              <p className={`text-[10px] font-bold uppercase tracking-widest font-mono
                ${brief.type === 'warn' ? 'text-orange-warn' : brief.type === 'info' ? 'text-blue-accent' : 'text-green-glow'}
              `}>
                {brief.title}
              </p>
            </div>
            <p className="text-[10px] text-white/60 leading-relaxed font-mono">
              {brief.content}
            </p>
          </motion.div>
        ))}

        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center p-4 border border-blue-accent/20 bg-blue-accent/5 rounded-xl border-dashed"
          >
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-accent animate-ping" />
              <span className="text-[9px] text-blue-accent font-mono uppercase tracking-widest font-bold">Scanning Global Signals...</span>
            </div>
          </motion.div>
        )}
      </div>
    </GlassCard>
  )
}
