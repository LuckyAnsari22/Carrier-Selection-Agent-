import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { scoreCarriers, runQBR } from '../api/client'
import GlassCard from '../components/shared/GlassCard'
import GlowButton from '../components/shared/GlowButton'

export default function QBRScorecard() {
    const [carriers, setCarriers] = useState([])
    const [selectedId, setSelectedId] = useState('')
    const [loading, setLoading] = useState(false)
    const [report, setReport] = useState(null)
    const [initialLoading, setInitialLoading] = useState(true)

    const [formData, setFormData] = useState({
        lane: 'Mumbai-Delhi',
        quarter: 'Q1',
        year: 2026
    })

    useEffect(() => {
        const fetchCarriers = async () => {
            try {
                const res = await scoreCarriers()
                const carrierList = res.data.carriers || res.data.rankings || []
                setCarriers(carrierList)
                if (carrierList.length > 0) {
                    setSelectedId(carrierList[0].carrier_id)
                }
            } catch (err) { console.error(err) }
            finally { setInitialLoading(false) }
        }
        fetchCarriers()
    }, [])

    const generateQBR = async () => {
        setLoading(true)
        try {
            const res = await runQBR({
                carrier_id: selectedId,
                lane: formData.lane,
                quarter: formData.quarter,
                year: formData.year
            })
            setReport(res.data)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-ice border-t-transparent rounded-full animate-spin" />
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
                    <p className="text-ice font-mono text-sm uppercase tracking-widest mb-2">Carrier Relationship Management</p>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        QBR <span className="text-gold">Performance Scorecard</span>
                    </h1>
                    <p className="text-white/50 text-lg max-w-2xl">
                        Auto-generate quarterly review reports to manage carrier relationships.
                        Data-led, professional structure optimized for joint-improvement meetings.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Input Selection */}
                    <div className="lg:col-span-4 space-y-6">
                        <GlassCard className="p-6">
                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6">Review Parameters</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Carrier</label>
                                    <select
                                        value={selectedId}
                                        onChange={e => setSelectedId(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm outline-none"
                                    >
                                        {carriers.map(c => (
                                            <option key={c.carrier_id} value={c.carrier_id}>{c.carrier_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Quarter</label>
                                        <select
                                            value={formData.quarter}
                                            onChange={e => setFormData({ ...formData, quarter: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm outline-none"
                                        >
                                            <option>Q1</option>
                                            <option>Q2</option>
                                            <option>Q3</option>
                                            <option>Q4</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Year</label>
                                        <input
                                            type="number"
                                            value={formData.year}
                                            onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Focus Lane</label>
                                    <input
                                        type="text"
                                        value={formData.lane}
                                        onChange={e => setFormData({ ...formData, lane: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm outline-none"
                                    />
                                </div>

                                <GlowButton onClick={generateQBR} disabled={loading} className="w-full">
                                    {loading ? 'Compiling Performance Metrics...' : 'Generate QBR Scorecard →'}
                                </GlowButton>
                            </div>
                        </GlassCard>

                        <div className="p-5 border border-white/5 bg-white/[0.02] rounded-2xl">
                            <h4 className="text-[10px] font-bold text-gold uppercase mb-3 tracking-widest">SLA Targets</h4>
                            <div className="space-y-2 text-[10px] text-white/40">
                                <div className="flex justify-between"><span>OTD Target</span><span className="text-white">≥ 95%</span></div>
                                <div className="flex justify-between"><span>Damage Target</span><span className="text-white">≤ 0.8%</span></div>
                                <div className="flex justify-between"><span>Invoice Target</span><span className="text-white">≥ 99%</span></div>
                                <div className="flex justify-between"><span>Claims Target</span><span className="text-white">≤ 7 Days</span></div>
                            </div>
                        </div>
                    </div>

                    {/* QBR Report View */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <div className="h-full min-h-[500px] flex flex-col items-center justify-center space-y-4">
                                    <div className="w-10 h-10 border-2 border-ice/20 border-t-ice rounded-full animate-spin" />
                                    <p className="text-[10px] uppercase font-mono tracking-widest text-ice">Analyzing Quarterly Performance Deltas...</p>
                                </div>
                            ) : report ? (
                                <motion.div
                                    key="report"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <GlassCard className="p-10 border-t-4 border-t-gold bg-[#0d0d12] shadow-2xl relative">
                                        <div className="absolute top-0 right-0 p-4 select-none opacity-5">
                                            <div className="text-9xl font-bold font-mono tracking-tighter -rotate-12">QBR</div>
                                        </div>

                                        <div className="mb-10 flex justify-between items-end border-b border-white/5 pb-8">
                                            <div>
                                                <div className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-2">Performance Document [Internal Use]</div>
                                                <h2 className="text-2xl font-bold uppercase tracking-tight">{report.carrier_name}</h2>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Generated by</div>
                                                <div className="text-xs font-bold text-ice font-mono">CarrierIQ AI v3</div>
                                            </div>
                                        </div>

                                        <div className="qbr-report font-serif text-white/90 whitespace-pre-wrap leading-relaxed">
                                            {report.qbr_report}
                                        </div>

                                        <div className="mt-12 flex justify-between items-center pt-8 border-t border-white/5">
                                            <div className="flex gap-4">
                                                <button className="text-[10px] text-white/30 uppercase font-bold hover:text-white transition underline decoration-dotted">Print Briefing</button>
                                                <button className="text-[10px] text-white/30 uppercase font-bold hover:text-white transition underline decoration-dotted">Secure Archive</button>
                                            </div>
                                            <div className="text-[10px] text-white/10 font-mono italic">
                                                Ref: QBR_{report.carrier_name.replace(/\s+/g, '_')}_{new Date().getTime()}
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ) : (
                                <div className="h-[600px] border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center p-12 text-center opacity-40">
                                    <div className="text-5xl mb-6">📅</div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Awaiting Session Initiation</h3>
                                    <p className="max-w-xs text-sm text-white/40 mb-8 leading-relaxed">
                                        Select a carrier and review period to synthesize a collaborative business review document.
                                        Root causes and improvement plans will be auto-generated based on quarterly variance.
                                    </p>
                                    <GlowButton variant="outline" onClick={generateQBR} className="text-xs">
                                        Initialize QBR Workflow →
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
