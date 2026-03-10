import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import GlassCard from '../components/shared/GlassCard'
import GlowButton from '../components/shared/GlowButton'

const API_BASE = '/api'

export default function MLOpsFeedback() {
    const [carriers, setCarriers] = useState([])
    const [loading, setLoading] = useState(false)
    const [analysis, setAnalysis] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [activeTab, setActiveTab] = useState('analysis')

    const [outcomeData, setOutcomeData] = useState({
        carrier_id: '',
        lane: 'Lane-A',
        actual_ontime_pct: 95,
        actual_damage_rate: 0.5,
        actual_cost_per_km: 30
    })

    const fetchAnalysis = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${API_BASE}/feedback/analysis`)
            setAnalysis(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnalysis()
        const fetchCarriers = async () => {
            try {
                const res = await axios.get(`${API_BASE}/score`)
                setCarriers(res.data.carriers)
                if (res.data.carriers.length > 0) {
                    setOutcomeData(prev => ({ ...prev, carrier_id: res.data.carriers[0].carrier_id }))
                }
            } catch (err) { console.error(err) }
        }
        fetchCarriers()
    }, [])

    const handleSubmitOutcome = async () => {
        setSubmitting(true)
        try {
            await axios.post(`${API_BASE}/feedback/`, outcomeData)
            alert('Outcome recorded. MLOps feedback loop updated.')
            fetchAnalysis()
        } catch (err) { console.error(err) }
        finally { setSubmitting(false) }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white pt-24 px-6 pb-20">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 flex justify-between items-end"
                >
                    <div>
                        <p className="text-green-glow font-mono text-sm uppercase tracking-widest mb-2">Continuous Learning</p>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            MLOps <span className="text-blue-accent">Feedback Loop</span>
                        </h1>
                        <p className="text-white/50 text-lg max-w-2xl">
                            Monitor model performance, detect drift, and analyze why humans override AI decisions
                            to improve long-term system reliability.
                        </p>
                    </div>
                    <div className="flex gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                        <button
                            onClick={() => setActiveTab('analysis')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition ${activeTab === 'analysis' ? 'bg-blue-accent text-white' : 'text-white/40 hover:bg-white/5'}`}
                        >
                            System Analysis
                        </button>
                        <button
                            onClick={() => setActiveTab('record')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition ${activeTab === 'record' ? 'bg-blue-accent text-white' : 'text-white/40 hover:bg-white/5'}`}
                        >
                            Record Outcome
                        </button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                    {activeTab === 'analysis' ? (
                        <>
                            {/* Stats Overview */}
                            <div className="xl:col-span-4 space-y-6">
                                <AnimatePresence mode="wait">
                                    {analysis && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                            <GlassCard className="p-6">
                                                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Network Outcomes</h3>
                                                <div className="space-y-3">
                                                    {[
                                                        { label: 'Excellent', val: analysis.stats.excellent_pct, color: 'bg-green-glow' },
                                                        { label: 'Good', val: analysis.stats.good_pct, color: 'bg-blue-accent' },
                                                        { label: 'Mixed', val: analysis.stats.mixed_pct, color: 'bg-yellow-400' },
                                                        { label: 'Poor', val: analysis.stats.poor_pct, color: 'bg-red-critical' }
                                                    ].map(s => (
                                                        <div key={s.label}>
                                                            <div className="flex justify-between text-[10px] mb-1">
                                                                <span className="text-white/60">{s.label}</span>
                                                                <span className="font-mono">{s.val.toFixed(1)}%</span>
                                                            </div>
                                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${s.val}%` }}
                                                                    className={`h-full ${s.color}`}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </GlassCard>

                                            <GlassCard className="p-6">
                                                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">ML Intelligence</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-3 bg-white/5 rounded-lg">
                                                        <div className="text-[10px] text-white/30 uppercase mb-1">Total Records</div>
                                                        <div className="text-2xl font-bold font-mono text-white">{analysis.stats.total_awards}</div>
                                                    </div>
                                                    <div className="p-3 bg-white/5 rounded-lg">
                                                        <div className="text-[10px] text-white/30 uppercase mb-1">Unique Carriers</div>
                                                        <div className="text-2xl font-bold font-mono text-white">{analysis.stats.total_unique_carriers}</div>
                                                    </div>
                                                </div>
                                                <div className="mt-4 p-3 bg-blue-accent/5 border border-blue-accent/20 rounded-lg">
                                                    <div className="text-[10px] text-blue-accent uppercase font-bold mb-1">Top Performer</div>
                                                    <div className="text-sm font-bold text-white">{analysis.stats.top_performing_carrier}</div>
                                                </div>
                                            </GlassCard>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* MLOps Report */}
                            <div className="xl:col-span-8">
                                {loading ? (
                                    <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 border-4 border-blue-accent border-t-transparent rounded-full animate-spin mb-4" />
                                        <p className="text-white/40 font-mono text-xs tracking-widest uppercase">Analyzing Systematic Biases...</p>
                                    </div>
                                ) : analysis && (
                                    <GlassCard className="p-10 border-t-4 border-t-blue-accent bg-blue-accent/[0.02] font-mono whitespace-pre-wrap text-sm leading-relaxed text-blue-100">
                                        <div className="mb-6 flex justify-between items-center bg-blue-accent/10 p-3 rounded-lg border border-blue-accent/30">
                                            <span className="font-bold">MLOPS REPORT v3.4.1</span>
                                            <span className="text-[10px] animate-pulse text-blue-accent opacity-60">SYSTEM STATUS: ANALYZING</span>
                                        </div>
                                        {analysis.report}
                                    </GlassCard>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Record Outcome Panel */}
                            <div className="xl:col-span-5">
                                <GlassCard className="p-8 space-y-6">
                                    <h2 className="text-xl font-bold">Record Award Outcome</h2>
                                    <p className="text-sm text-white/40">Manual entry for actual delivery performance to train the model.</p>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-white/40 uppercase mb-2">Carrier</label>
                                            <select
                                                value={outcomeData.carrier_id}
                                                onChange={e => setOutcomeData({ ...outcomeData, carrier_id: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-blue-accent/50 outline-none"
                                            >
                                                {carriers.map(c => (
                                                    <option key={c.carrier_id} value={c.carrier_id}>{c.carrier_name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-white/40 uppercase mb-2">Lane</label>
                                                <select
                                                    value={outcomeData.lane}
                                                    onChange={e => setOutcomeData({ ...outcomeData, lane: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm outline-none"
                                                >
                                                    <option>Mumbai-Delhi (Lane-A)</option>
                                                    <option>Bangalore-Pune (Lane-B)</option>
                                                    <option>Chennai-Kolkata (Lane-C)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-white/40 uppercase mb-2">Actual OTD %</label>
                                                <input
                                                    type="number"
                                                    value={outcomeData.actual_ontime_pct}
                                                    onChange={e => setOutcomeData({ ...outcomeData, actual_ontime_pct: parseFloat(e.target.value) })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-white/40 uppercase mb-2">Actual Damage Rate (%)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={outcomeData.actual_damage_rate}
                                                onChange={e => setOutcomeData({ ...outcomeData, actual_damage_rate: parseFloat(e.target.value) })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm outline-none"
                                            />
                                        </div>

                                        <GlowButton onClick={handleSubmitOutcome} disabled={submitting} className="w-full">
                                            {submitting ? 'Updating Models...' : 'Log Actual Performance →'}
                                        </GlowButton>
                                    </div>
                                </GlassCard>
                            </div>

                            <div className="xl:col-span-7 flex flex-col items-center justify-center p-12 bg-white/5 rounded-2xl border border-white/5 text-center">
                                <div className="text-4xl mb-6">🧠</div>
                                <h3 className="text-2xl font-bold text-white/80 mb-4">Continuous Self-Retraining</h3>
                                <p className="text-white/40 max-w-md leading-relaxed">
                                    Every outcome logged here directly impacts the risk model weights.
                                    If a carrier consistently underperforms their prediction, the XGBoost engine
                                    automatically adjusts their friction coefficient.
                                </p>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    )
}
