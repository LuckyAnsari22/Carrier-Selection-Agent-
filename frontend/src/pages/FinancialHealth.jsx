import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import GlassCard from '../components/shared/GlassCard'
import GlowButton from '../components/shared/GlowButton'

const API_BASE = '/api'

export default function FinancialHealth() {
    const [carriers, setCarriers] = useState([])
    const [selectedId, setSelectedId] = useState('')
    const [loading, setLoading] = useState(false)
    const [assessment, setAssessment] = useState(null)
    const [initialLoading, setInitialLoading] = useState(true)

    useEffect(() => {
        const fetchCarriers = async () => {
            try {
                const res = await axios.get(`${API_BASE}/score`)
                setCarriers(res.data.carriers)
                if (res.data.carriers.length > 0) {
                    setSelectedId(res.data.carriers[0].carrier_id)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setInitialLoading(false)
            }
        }
        fetchCarriers()
    }, [])

    const runAudit = async () => {
        setLoading(true)
        try {
            const res = await axios.post(`${API_BASE}/financial_health/`, {
                carrier_id: selectedId
            })
            setAssessment(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (score) => {
        if (score >= 80) return 'text-green-glow'
        if (score >= 60) return 'text-yellow-400'
        if (score >= 40) return 'text-orange-500'
        return 'text-red-critical'
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
                    <p className="text-blue-accent font-mono text-sm uppercase tracking-widest mb-2">Carrier Risk Intelligence</p>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Financial <span className="text-red-critical">Health Audit</span>
                    </h1>
                    <p className="text-white/50 text-lg max-w-2xl">
                        Predict carrier financial distress using public hard and soft signals.
                        Assess potential service disruptions before they occur in your network.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Audit Selection */}
                    <div className="lg:col-span-4 space-y-6">
                        <GlassCard className="p-6">
                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6">Select Carrier for Audit</h3>
                            <div className="space-y-4">
                                <select
                                    value={selectedId}
                                    onChange={(e) => setSelectedId(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-sm focus:border-blue-accent/50 outline-none transition"
                                >
                                    {carriers.map(c => (
                                        <option key={c.carrier_id} value={c.carrier_id}>{c.carrier_name} (Rank #{c.rank})</option>
                                    ))}
                                </select>
                                <GlowButton onClick={runAudit} disabled={loading} className="w-full">
                                    {loading ? 'Performing Audit...' : 'Run Financial Audit →'}
                                </GlowButton>
                            </div>
                        </GlassCard>

                        <div className="p-6 border-2 border-dashed border-white/5 rounded-2xl">
                            <h4 className="text-xs font-bold text-white/30 uppercase mb-4">What we analyze</h4>
                            <div className="space-y-3 text-xs text-white/40">
                                <div className="flex gap-2">
                                    <span className="text-blue-accent">●</span> Credit rating & FMCSA Score Patterns
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-blue-accent">●</span> LinkedIn/Glassdoor Driver Turnover
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-blue-accent">●</span> Equipment Financing Defaults
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-blue-accent">●</span> Asset Utilization and DOT Alerts
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Assessment View */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-[600px] flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/5 border-dashed"
                                >
                                    <div className="relative w-24 h-24 mb-6">
                                        <div className="absolute inset-0 border-4 border-blue-accent/20 rounded-full" />
                                        <div className="absolute inset-0 border-4 border-blue-accent border-r-transparent animate-spin rounded-full" />
                                    </div>
                                    <p className="font-mono text-xs uppercase tracking-[0.3em] text-blue-accent animate-pulse">Scanning Signal Database...</p>
                                </motion.div>
                            ) : assessment ? (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-6"
                                >
                                    {/* Status Card */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <GlassCard className="p-6 col-span-2 flex flex-col justify-center">
                                            <div className="flex items-center gap-6">
                                                <div className="text-6xl font-bold font-mono tracking-tighter">
                                                    {assessment.health_score}
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Financial Health Score</div>
                                                    <div className={`text-xl font-bold uppercase ${getStatusColor(assessment.health_score)}`}>
                                                        {assessment.health_score >= 80 ? 'STABLE' : assessment.health_score >= 60 ? 'WATCH' : assessment.health_score >= 40 ? 'ALERT' : 'CRITICAL'}
                                                    </div>
                                                </div>
                                            </div>
                                        </GlassCard>
                                        <GlassCard className="p-6">
                                            <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-2">Prediction Confidence</div>
                                            <div className="text-3xl font-bold font-mono text-blue-accent">92%</div>
                                            <div className="mt-2 h-1 bg-white/5 rounded-full">
                                                <div className="h-full bg-blue-accent w-[92%] rounded-full shadow-[0_0_10px_rgba(0,149,255,0.5)]" />
                                            </div>
                                        </GlassCard>
                                    </div>

                                    {/* Full Report */}
                                    <GlassCard className="p-10 bg-gradient-to-br from-white/[0.03] to-transparent relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
                                            <div className="text-xs font-mono font-bold tracking-widest border border-white/30 px-2 py-1">CERTIFIED CREDIT AUDIT</div>
                                        </div>
                                        <div className="font-mono text-sm text-blue-100 whitespace-pre-wrap leading-relaxed shadow-text">
                                            {assessment.assessment}
                                        </div>

                                        <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center">
                                            <div className="flex gap-4">
                                                <button className="text-[10px] uppercase font-bold text-white/30 hover:text-white transition decoration-dotted underline">Full History</button>
                                                <button className="text-[10px] uppercase font-bold text-white/30 hover:text-white transition decoration-dotted underline">Raw Signals</button>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ) : (
                                <div className="h-[600px] border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center px-10">
                                    <div className="text-4xl mb-6 opacity-30 select-none">💳</div>
                                    <h3 className="text-2xl font-bold text-white/60 mb-2">Audit System Ready</h3>
                                    <p className="text-white/30 max-w-sm mb-6">
                                        Choose a carrier to run an automated credit and financial health assessment.
                                        The system analyzes signals from DOT files, job postings, and peer market shifts.
                                    </p>
                                    <GlowButton onClick={runAudit} variant="outline">
                                        Start Quick Scan →
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
