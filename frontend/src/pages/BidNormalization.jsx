import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import GlassCard from '../components/shared/GlassCard'
import GlowButton from '../components/shared/GlowButton'

const API_BASE = '/api'

export default function BidNormalization() {
    const [rawText, setRawText] = useState('')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState(null)
    const [error, setError] = useState(null)

    const handleNormalize = async () => {
        if (!rawText.trim()) return

        setLoading(true)
        setError(null)
        try {
            const response = await axios.post(`${API_BASE}/normalize/`, {
                raw_submissions: rawText
            })
            setResults(response.data)
        } catch (err) {
            console.error(err)
            setError(err.response?.data?.message || 'Normalization failed. Check your connection and API key.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white pt-24 px-6 pb-20">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Bid <span className="text-green-glow">Normalizer</span>
                    </h1>
                    <p className="text-white/60 text-lg max-w-2xl">
                        Inconsistent carrier quotes are a procurement nightmare.
                        Our Expert AI normalizes raw submissions into a single comparable standard in seconds.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <GlassCard className="p-6 h-full flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <span className="text-green-glow">01</span> Raw Submissions
                                </h2>
                                <button
                                    onClick={() => setRawText('Carrier A: $2 per kg, 3 business day transit. Fuel included. Liability $10/kg.\nCarrier B: 1,500 USD per 500kg shipment. 5 calendar days. 15% fuel surcharge. Liability missing.')}
                                    className="text-xs text-white/40 hover:text-white transition"
                                >
                                    Load Example
                                </button>
                            </div>
                            <textarea
                                value={rawText}
                                onChange={(e) => setRawText(e.target.value)}
                                placeholder="Paste carrier emails, text quotes, or unstructured bid data here..."
                                className="flex-grow bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-sm focus:outline-none focus:border-green-glow/50 transition resize-none min-h-[300px]"
                            />
                            <div className="mt-6">
                                <GlowButton
                                    onClick={handleNormalize}
                                    disabled={loading || !rawText.trim()}
                                    className="w-full"
                                >
                                    {loading ? 'Processing with Gemini AI...' : 'Normalize Bids →'}
                                </GlowButton>
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* Results Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <GlassCard className="p-6 h-full min-h-[400px]">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="text-green-glow">02</span> Normalized Standard
                            </h2>

                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center h-full py-20"
                                    >
                                        <div className="w-12 h-12 border-4 border-green-glow/20 border-t-green-glow rounded-full animate-spin mb-4" />
                                        <p className="text-white/60 font-mono text-sm animate-pulse">ANALYZING CONTRACT TERMS...</p>
                                    </motion.div>
                                ) : error ? (
                                    <motion.div
                                        key="error"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-red-critical/10 border border-red-critical/30 p-4 rounded-lg text-red-critical text-sm"
                                    >
                                        {error}
                                    </motion.div>
                                ) : results ? (
                                    <motion.div
                                        key="results"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-6"
                                    >
                                        {results.map((bid, i) => (
                                            <div key={i} className="border-b border-white/5 pb-6 last:border-0 last:pb-0">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="text-lg font-bold text-green-glow">{bid.carrier_name}</h3>
                                                    <div className="bg-green-glow/10 border border-green-glow/30 px-2 py-1 rounded text-[10px] font-bold text-green-glow uppercase tracking-wider">
                                                        Verified Standard
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div className="bg-white/5 p-3 rounded">
                                                        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Cost per KG (USD)</p>
                                                        <p className="text-2xl font-bold font-mono">
                                                            {bid.normalized_cost_per_kg_usd ? `$${bid.normalized_cost_per_kg_usd.toFixed(2)}` : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="bg-white/5 p-3 rounded">
                                                        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Transit (Days)</p>
                                                        <p className="text-2xl font-bold font-mono">
                                                            {bid.transit_days_calendar ? `${bid.transit_days_calendar}d` : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 mb-4">
                                                    <div className="bg-white/5 p-2 rounded text-center">
                                                        <p className="text-[9px] text-white/40 uppercase mb-1">Fuel</p>
                                                        <p className="text-xs font-bold text-white/80">
                                                            {bid.fuel_surcharge_pct ? `${bid.fuel_surcharge_pct}%` : 'Embedded'}
                                                        </p>
                                                    </div>
                                                    <div className="bg-white/5 p-2 rounded text-center">
                                                        <p className="text-[9px] text-white/40 uppercase mb-1">Liability</p>
                                                        <p className="text-xs font-bold text-white/80">
                                                            {bid.liability_per_kg_usd ? `$${bid.liability_per_kg_usd}/kg` : 'MISSING'}
                                                        </p>
                                                    </div>
                                                    <div className="bg-white/5 p-2 rounded text-center">
                                                        <p className="text-[9px] text-white/40 uppercase mb-1">SLA Accuracy</p>
                                                        <p className="text-xs font-bold text-white/80">
                                                            {bid.invoice_accuracy_sla_pct ? `${bid.invoice_accuracy_sla_pct}%` : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {bid.anomaly_flags?.length > 0 && (
                                                    <div className="mb-3">
                                                        <p className="text-[10px] text-orange-warn uppercase tracking-widest mb-1">Anomaly Flags</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {bid.anomaly_flags.map((flag, j) => (
                                                                <span key={j} className="bg-orange-warn/10 border border-orange-warn/30 px-2 py-0.5 rounded text-[10px] text-orange-warn">
                                                                    {flag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div>
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Normalization Notes</p>
                                                    <p className="text-xs text-white/70 italic leading-relaxed">
                                                        "{bid.normalization_notes}"
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                                        <div className="text-4xl mb-4 opacity-20">📜</div>
                                        <p className="text-white/30 text-sm max-w-[200px]">
                                            Awaiting input to generate normalization report.
                                        </p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </GlassCard>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
