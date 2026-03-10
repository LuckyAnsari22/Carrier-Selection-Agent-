import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import GlassCard from '../components/shared/GlassCard'
import GlowButton from '../components/shared/GlowButton'

const API_BASE = '/api'

export default function AwardStrategy() {
    const [carriers, setCarriers] = useState([])
    const [loading, setLoading] = useState(false)
    const [strategy, setStrategy] = useState(null)
    const [initialLoading, setInitialLoading] = useState(true)

    const [formData, setFormData] = useState({
        lane: 'Mumbai-Delhi',
        priority_carrier_id: '',
        secondary_carrier_id: '',
        contract_term_months: 12,
        annual_volume_impact_kg: 1500000
    })

    useEffect(() => {
        const fetchCarriers = async () => {
            try {
                const res = await axios.get(`${API_BASE}/score`)
                setCarriers(res.data.carriers)
                if (res.data.carriers.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        priority_carrier_id: res.data.carriers[0].carrier_id,
                        secondary_carrier_id: res.data.carriers[1]?.carrier_id || ''
                    }))
                }
            } catch (err) { console.error(err) }
            finally { setInitialLoading(false) }
        }
        fetchCarriers()
    }, [])

    const designStrategy = async () => {
        setLoading(true)
        try {
            const res = await axios.post(`${API_BASE}/award_strategy/`, formData)
            setStrategy(res.data)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-accent border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white pt-24 px-6 pb-20">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <p className="text-yellow-400 font-mono text-sm uppercase tracking-widest mb-2">Network Design</p>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Award <span className="text-blue-accent">Strategy Portfolios</span>
                    </h1>
                    <p className="text-white/50 text-lg max-w-2xl">
                        Design robust carrier award structures using Portfolio Theory and Real Options Frameworks
                        for industrial-scale supply chain contracts.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Input Selection */}
                    <div className="lg:col-span-4 space-y-6">
                        <GlassCard className="p-6">
                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6">Strategy Parameters</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Lane</label>
                                    <input
                                        type="text"
                                        value={formData.lane}
                                        onChange={e => setFormData({ ...formData, lane: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-blue-accent outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Total Annual Volume (KG)</label>
                                    <input
                                        type="number"
                                        value={formData.annual_volume_impact_kg}
                                        onChange={e => setFormData({ ...formData, annual_volume_impact_kg: parseFloat(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-blue-accent outline-none font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Primary Choice</label>
                                    <select
                                        value={formData.priority_carrier_id}
                                        onChange={e => setFormData({ ...formData, priority_carrier_id: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm outline-none"
                                    >
                                        {carriers.map(c => (
                                            <option key={c.carrier_id} value={c.carrier_id} className="bg-black text-white">{c.carrier_name} (Rank #{c.rank})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Secondary / Continuity</label>
                                    <select
                                        value={formData.secondary_carrier_id}
                                        onChange={e => setFormData({ ...formData, secondary_carrier_id: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm outline-none"
                                    >
                                        {carriers.filter(c => c.carrier_id !== formData.priority_carrier_id).map(c => (
                                            <option key={c.carrier_id} value={c.carrier_id} className="bg-black text-white">{c.carrier_name} (Rank #{c.rank})</option>
                                        ))}
                                    </select>
                                </div>

                                <GlowButton onClick={designStrategy} disabled={loading} className="w-full">
                                    {loading ? 'Modeling Strategy...' : 'Design Award Strategy →'}
                                </GlowButton>
                            </div>
                        </GlassCard>

                        <div className="bg-gradient-to-br from-blue-accent/10 to-transparent p-6 rounded-2xl border border-blue-accent/20">
                            <h4 className="text-[10px] font-bold text-blue-accent uppercase mb-3">Consultant Frameworks</h4>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs font-bold text-white mb-1 tracking-tight">Portfolio Theory</div>
                                    <p className="text-white/40 text-[10px] leading-relaxed">Diversify lane concentration to prevent single point of failure in asset networks.</p>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white mb-1 tracking-tight">Real Options</div>
                                    <p className="text-white/40 text-[10px] leading-relaxed">Pricing in volume flex clauses to maintain secondary capacity during surges.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Strategy Output */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-[600px] flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-2xl"
                                >
                                    <div className="w-10 h-10 border-2 border-blue-accent/30 border-t-blue-accent rounded-full animate-spin mb-4" />
                                    <p className="text-blue-accent/60 font-mono text-[10px] tracking-widest uppercase animate-pulse">Running Portolio Theory Simulations...</p>
                                </motion.div>
                            ) : strategy ? (
                                <motion.div
                                    key="strategy"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    <GlassCard className="p-10 border-t-4 border-t-blue-accent bg-blue-accent/[0.01] relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                            <h4 className="font-bold text-6xl font-mono rotate-12 tracking-tighter">STRATEGY</h4>
                                        </div>
                                        <div className="mb-8 flex justify-between items-start pt-2">
                                            <div>
                                                <div className="text-xs font-bold text-blue-accent uppercase tracking-[0.2em] mb-1">Contract Proposal</div>
                                                <h2 className="text-2xl font-bold">{strategy.lane} Lane Structure</h2>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-white/30 tracking-widest uppercase">Consultant Agent v2.1</div>
                                                <div className="text-sm font-bold text-white/80">{new Date().toLocaleDateString()}</div>
                                            </div>
                                        </div>

                                        <div className="award-strategy-report font-serif text-white/90 whitespace-pre-wrap leading-relaxed space-y-4">
                                            {strategy.strategy}
                                        </div>

                                        <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-white/30">
                                            <div>Portfolio Risk: Diversified</div>
                                            <div className="flex gap-6">
                                                <span className="hover:text-blue-accent cursor-pointer transition underline decoration-dotted">Internal Audit</span>
                                                <span className="hover:text-blue-accent cursor-pointer transition underline decoration-dotted">Export CSV</span>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ) : (
                                <div className="h-[600px] border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center p-10 opacity-60">
                                    <div className="text-5xl mb-6 scale-90 select-none">📊</div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Strategy Designer</h3>
                                    <p className="text-white/40 max-w-sm mb-8 text-sm">
                                        Select primary and secondary carriers to design a portfolio award strategy.
                                        The system will define performance gates, flex clauses, and annual cost outcomes.
                                    </p>
                                    <GlowButton onClick={designStrategy} variant="outline" className="text-xs">
                                        Initialize Modeling Workflow →
                                    </GlowButton>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
