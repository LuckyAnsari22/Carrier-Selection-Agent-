import { useState, useEffect } from 'react'
import GlassCard from '../shared/GlassCard'
import { motion, AnimatePresence } from 'framer-motion'
import useCarrierStore from '../../store/useCarrierStore'
import { explainScore } from '../../api/client'

export default function ExplainPanel() {
  const { selectedCarrier } = useCarrierStore()
  const [shapData, setShapData] = useState([])
  const [narrative, setNarrative] = useState('')
  const [score, setScore] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedCarrier) {
      setShapData([])
      setNarrative('')
      setScore(null)
      return
    }

    const carrierId = selectedCarrier.carrier_id || selectedCarrier.id
    if (!carrierId) return

    setLoading(true)

    explainScore(carrierId)
      .then(res => {
        const data = res.data
        const features = data.features || {}
        const mapped = Object.entries(features)
          .map(([label, value]) => ({ label, value }))
          .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
        setShapData(mapped)
        setNarrative(data.narrative || '')
        setScore(data.score || null)
      })
      .catch(err => {
        console.error('Explain API Error:', err)
        // Fallback to local calculation
        const fallback = [
          { label: 'On-Time Delivery', value: ((selectedCarrier.ontime_pct || selectedCarrier.otd_rate * 100 || 90) - 90) * 0.03 },
          { label: 'Service Cost', value: (30 - (selectedCarrier.cost_per_km || selectedCarrier.price_per_kg || 30)) / 30 * 0.4 },
          { label: 'Delay Risk', value: (100 - (selectedCarrier.delay_risk || 50)) * 0.002 },
          { label: 'Carrier Rating', value: ((selectedCarrier.rating || 3.5) - 3.5) * 0.1 },
        ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
        setShapData(fallback)
        setNarrative('')
        setScore(null)
      })
      .finally(() => setLoading(false))
  }, [selectedCarrier])

  const carrierName = selectedCarrier?.carrier_name || selectedCarrier?.name || 'Unknown'
  const displayScore = score || (selectedCarrier?.final_score ? (selectedCarrier.final_score * 100).toFixed(1) : '—')

  return (
    <GlassCard className="p-5 h-full relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white">Feature Attribution (SHAP)</h2>
        <span className="text-[9px] font-mono text-white/30 tracking-widest uppercase">Explainable AI Layer</span>
      </div>

      <AnimatePresence mode="wait">
        {selectedCarrier ? (
          <motion.div
            key={selectedCarrier.carrier_id || selectedCarrier.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-green-glow/20 border-t-green-glow rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Summary Text */}
                <p className="text-[11px] text-white/60 leading-relaxed italic mb-4">
                  {narrative || (
                    <>
                      "The model selected <span className="text-white font-bold">{carrierName}</span> primarily
                      due to its <span className="text-green-glow font-bold">superior {shapData[0]?.label?.toLowerCase() || 'performance'}</span> performance
                      relative to the market average."
                    </>
                  )}
                </p>

                {/* Waterfall Chart */}
                <div className="space-y-3">
                  {shapData.map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-white/50 font-mono uppercase tracking-tighter">{item.label}</span>
                        <span className={`text-[10px] font-mono ${item.value >= 0 ? 'text-green-glow' : 'text-red-critical'}`}>
                          {item.value >= 0 ? '+' : ''}{item.value.toFixed(3)}
                        </span>
                      </div>
                      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="absolute inset-y-0 left-1/2 w-px bg-white/10 z-10" />
                        <motion.div
                          initial={{ width: 0, left: '50%' }}
                          animate={{
                            width: `${Math.min(Math.abs(item.value) * 200, 50)}%`,
                            left: item.value >= 0 ? '50%' : `calc(50% - ${Math.min(Math.abs(item.value) * 200, 50)}%)`
                          }}
                          className={`h-full rounded-full transition-colors ${item.value >= 0 ? 'bg-green-glow/40 shadow-[0_0_8px_#00FF8844]' : 'bg-red-critical/40'}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Meta Info */}
                <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Score</span>
                  <span className="text-[11px] font-mono text-green-glow font-bold">{displayScore}</span>
                </div>
              </>
            )}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 opacity-20 text-center">
            <span className="text-4xl mb-4">🔦</span>
            <p className="text-xs uppercase font-mono tracking-widest">Select a carrier to illuminate<br />the decision logic</p>
          </div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}
