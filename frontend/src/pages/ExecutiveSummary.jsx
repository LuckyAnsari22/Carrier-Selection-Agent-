import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { scoreCarriers, runExecutiveSummary } from '../api/client'
import GlassCard from '../components/shared/GlassCard'
import GlowButton from '../components/shared/GlowButton'

export default function ExecutiveSummary() {
    const [carriers, setCarriers] = useState([])
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [summary, setSummary] = useState(null)

    const [formData, setFormData] = useState({
        lane: 'Mumbai-Delhi',
        urgency: 'Standard',
        primary_carrier_id: '',
        secondary_carrier_id: '',
        primary_allocation: 70,
        secondary_allocation: 30,
        current_spend: 1200000,
        review_weeks: 12
    })

    useEffect(() => {
        const fetchCarriers = async () => {
            try {
                const res = await scoreCarriers()
                const carrierList = res.data.carriers || res.data.rankings || []
                setCarriers(carrierList)
                if (carrierList.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        primary_carrier_id: carrierList[0].carrier_id,
                        secondary_carrier_id: carrierList[1]?.carrier_id || ''
                    }))
                }
            } catch (err) {
                console.error('Failed to fetch carriers', err)
            } finally {
                setInitialLoading(false)
            }
        }
        fetchCarriers()
    }, [])

    const handleGenerate = async () => {
        setLoading(true)
        try {
            const res = await runExecutiveSummary(formData)
            setSummary(res.data.summary)
        } catch (err) {
            console.error(err)
            alert('Failed to generate summary.')
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-green-glow border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white pt-24 px-6 pb-20">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <p className="text-green-glow font-mono text-sm uppercase tracking-widest mb-2">Management Intelligence</p>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        CPO <span className="text-blue-accent">Executive Briefing</span>
                    </h1>
                    <p className="text-white/50 text-lg max-w-2xl">
                        Generate defensible, numbers-led reports for the C-suite following the Pyramid Principle.
                        Lead with the decision, justify with data.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Configuration Form */}
                    <div className="lg:col-span-5 space-y-6">
                        <GlassCard className="p-6">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="text-green-glow">01</span> Parameters
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Shipping Lane</label>
                                    <input
                                        type="text"
                                        value={formData.lane}
                                        onChange={(e) => setFormData({ ...formData, lane: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-green-glow/50 transition outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Urgency</label>
                                        <select
                                            value={formData.urgency}
                                            onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-green-glow/50 transition outline-none"
                                        >
                                            <option value="Standard">Standard</option>
                                            <option value="Priority">Priority</option>
                                            <option value="Critical">Critical</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Review Period</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={formData.review_weeks}
                                                onChange={(e) => setFormData({ ...formData, review_weeks: parseInt(e.target.value) })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-green-glow/50 transition outline-none"
                                            />
                                            <span className="text-xs text-white/30 whitespace-nowrap">Weeks</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Primary Carrier</label>
                                    <select
                                        value={formData.primary_carrier_id}
                                        onChange={(e) => setFormData({ ...formData, primary_carrier_id: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-green-glow/50 transition outline-none mb-2"
                                    >
                                        {carriers.map(c => (
                                            <option key={c.carrier_id} value={c.carrier_id}>{c.carrier_name} (Rank #{c.rank})</option>
                                        ))}
                                    </select>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range" min="0" max="100"
                                            value={formData.primary_allocation}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setFormData({ ...formData, primary_allocation: val, secondary_allocation: 100 - val });
                                            }}
                                            className="flex-grow accent-green-glow"
                                        />
                                        <span className="text-sm font-mono text-green-glow w-10">{formData.primary_allocation}%</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Backup Carrier (Optional)</label>
                                    <select
                                        value={formData.secondary_carrier_id}
                                        onChange={(e) => setFormData({ ...formData, secondary_carrier_id: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-green-glow/50 transition outline-none mb-2"
                                    >
                                        <option value="">None</option>
                                        {carriers.filter(c => c.carrier_id !== formData.primary_carrier_id).map(c => (
                                            <option key={c.carrier_id} value={c.carrier_id}>{c.carrier_name} (Rank #{c.rank})</option>
                                        ))}
                                    </select>
                                    <div className="text-right">
                                        <span className="text-xs font-mono text-white/40">Auto-allocated: {formData.secondary_allocation}%</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Current Annual Spend (USD)</label>
                                    <input
                                        type="number"
                                        value={formData.current_spend}
                                        onChange={(e) => setFormData({ ...formData, current_spend: parseInt(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-green-glow/50 transition outline-none"
                                    />
                                </div>

                                <GlowButton
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    className="w-full mt-6"
                                >
                                    {loading ? 'Synthesizing Briefing...' : 'Generate CPO Briefing →'}
                                </GlowButton>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Briefing Display */}
                    <div className="lg:col-span-7">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full min-h-[500px] flex flex-col items-center justify-center text-center"
                                >
                                    <div className="w-16 h-16 border-4 border-blue-accent/20 border-t-blue-accent rounded-full animate-spin mb-6" />
                                    <p className="text-white/60 font-mono text-sm tracking-widest uppercase">Aligning Decision Factors...</p>
                                </motion.div>
                            ) : summary ? (
                                <motion.div
                                    key="summary"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <GlassCard className="p-10 border-t-4 border-t-green-glow bg-[#0d0d15] relative overflow-hidden">
                                        {/* Watermark bg */}
                                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                            <div className="text-90 font-bold rotate-12">TOP SECRET</div>
                                        </div>

                                        <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-gradient-to-br from-green-glow to-blue-accent" />
                                                <div>
                                                    <h3 className="font-bold text-lg leading-none">LoRRI Intelligence</h3>
                                                    <span className="text-[10px] text-white/40 tracking-[0.2em] uppercase">Enterprise Protocol v3</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Generated On</div>
                                                <div className="text-xs font-mono">{new Date().toLocaleDateString()}</div>
                                            </div>
                                        </div>

                                        <div className="executive-briefing font-serif text-white/90 leading-relaxed whitespace-pre-wrap selection:bg-green-glow/30">
                                            {summary}
                                        </div>

                                        <div className="mt-12 flex justify-between items-end">
                                            <div className="text-[10px] text-white/30 max-w-[200px] leading-tight italic">
                                                Proprietary AI Synthesis based on 47 neural decision nodes and TOPSIS multi-criteria ranking.
                                            </div>
                                            <div className="flex gap-4">
                                                <button className="text-xs text-white/40 hover:text-white transition decoration-dotted underline">Download PDF</button>
                                                <button className="text-xs text-white/40 hover:text-white transition decoration-dotted underline">Secure Share</button>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ) : (
                                <div className="h-full min-h-[500px] border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center px-10">
                                    <div className="text-4xl mb-6 opacity-20">📜</div>
                                    <h3 className="text-2xl font-bold text-white/60 mb-2">Awaiting Decision Parameters</h3>
                                    <p className="text-white/30 max-w-sm mb-8">
                                        Configure the award allocation on the left. The Executive Summary system will then generate a ready-to-send management briefing using the Pyramid Principle.
                                    </p>
                                    <GlowButton onClick={handleGenerate} variant="outline">
                                        Quick Generate Balanced →
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
