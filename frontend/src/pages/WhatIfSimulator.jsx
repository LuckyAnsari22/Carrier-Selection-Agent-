import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import GlassCard from '../components/shared/GlassCard'
import GlowButton from '../components/shared/GlowButton'

const API_BASE = '/api'

const SCENARIOS = [
    {
        id: 'MONSOON',
        name: 'Monsoon Protocol',
        icon: '🌧️',
        description: 'Prioritizes reliability and transit consistency over cost.',
        weights: { cost: 20, reliability: 60, speed: 10, quality: 10 }
    },
    {
        id: 'COST',
        name: 'Cost Emergency',
        icon: '📉',
        description: 'Aggressive focus on base rates for budget recovery.',
        weights: { cost: 65, reliability: 20, speed: 10, quality: 5 }
    },
    {
        id: 'QUALITY',
        name: 'Zero Tolerance',
        icon: '🚫',
        description: 'Eliminates high damage carriers from the network.',
        weights: { cost: 30, reliability: 30, speed: 20, quality: 20 },
        filters: { max_damage: 1.0 }
    },
    {
        id: 'CAPACITY',
        name: 'Capacity Crisis',
        icon: '🚛',
        description: 'Deprioritizes overextended carriers (>80% util).',
        weights: { cost: 30, reliability: 35, speed: 15, quality: 20 },
        filters: { max_util: 0.8 }
    },
    {
        id: 'BALANCED',
        name: 'Balanced Approach',
        icon: '⚖️',
        description: 'Optimal trade-off between all procurement metrics.',
        weights: { cost: 40, reliability: 35, speed: 15, quality: 10 }
    }
]

export default function WhatIfSimulator() {
    const [activeScenario, setActiveScenario] = useState(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)

    const runSimulation = async (scenario) => {
        setActiveScenario(scenario.id)
        setLoading(true)
        setError(null)

        try {
            const response = await axios.post(`${API_BASE}/whatif/`, {
                scenario_name: scenario.name,
                weights: scenario.weights,
                filters: scenario.filters
            })
            setResult(response.data)
        } catch (err) {
            console.error(err)
            setError('Simulation failed to run.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white pt-24 px-6 pb-20">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <p className="text-green-glow font-mono text-sm uppercase tracking-widest mb-2">Simulation Engine</p>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        What-If <span className="text-blue-accent">Scenario Modeler</span>
                    </h1>
                    <p className="text-white/50 text-lg max-w-2xl">
                        Simulate the impact of market disruptions and priority shifts on your carrier rankings
                        with instant re-scoring and financial impact analysis.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Scenario Selection */}
                    <div className="xl:col-span-4 space-y-4">
                        <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">Available Scenarios</h2>
                        {SCENARIOS.map((scenario) => (
                            <motion.div
                                key={scenario.id}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <GlassCard
                                    onClick={() => runSimulation(scenario)}
                                    className={`p-5 cursor-pointer border-l-4 transition-all ${activeScenario === scenario.id ? 'bg-white/10 border-l-blue-accent' : 'border-l-transparent hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex gap-4">
                                        <span className="text-3xl">{scenario.icon}</span>
                                        <div>
                                            <h3 className="font-bold text-white">{scenario.name}</h3>
                                            <p className="text-xs text-white/50 mt-1">{scenario.description}</p>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>

                    {/* Analysis View */}
                    <div className="xl:col-span-8">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-[600px] flex flex-col items-center justify-center text-center"
                                >
                                    <div className="relative w-24 h-24 mb-6">
                                        <div className="absolute inset-0 border-4 border-blue-accent/20 rounded-full" />
                                        <div className="absolute inset-0 border-4 border-blue-accent border-t-transparent rounded-full animate-spin" />
                                        <div className="absolute inset-4 bg-blue-accent/10 rounded-full flex items-center justify-center">
                                            <span className="text-blue-accent font-bold">Rescoring</span>
                                        </div>
                                    </div>
                                    <p className="text-white/60 font-mono text-sm animate-pulse tracking-widest">
                                        COMPUTING TOPSIS RANKINGS & IMPACT...
                                    </p>
                                </motion.div>
                            ) : result ? (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-6"
                                >
                                    {/* LLM Report Card */}
                                    <GlassCard className="p-8 border-t-4 border-t-blue-accent bg-blue-accent/[0.02]">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="bg-blue-accent/10 text-blue-accent border border-blue-accent/30 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest">
                                                Interactive Analysis Report
                                            </div>
                                            <div className="text-white/30 text-xs font-mono">AGENT: WHAT-IF MODELER v3</div>
                                        </div>
                                        <pre className="whitespace-pre-wrap font-sans text-white/90 text-sm leading-relaxed">
                                            {result.analysis}
                                        </pre>
                                    </GlassCard>

                                    {/* Quantitative Impacts */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <GlassCard className="p-6">
                                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Financial Impact</h3>
                                            <div className="flex items-end gap-3">
                                                <span className={`text-4xl font-bold font-mono ${result.impact.financial_delta_usd >= 0 ? 'text-red-critical' : 'text-green-glow'}`}>
                                                    {result.impact.financial_delta_usd >= 0 ? '+' : ''}{Math.round(result.impact.financial_delta_usd).toLocaleString()} USD
                                                </span>
                                                <span className="text-white/30 text-sm pb-1">/ month</span>
                                            </div>
                                            <p className="text-xs text-white/50 mt-2">Estimated spend change across top 5 carriers</p>
                                        </GlassCard>

                                        <GlassCard className="p-6">
                                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Service Reliability</h3>
                                            <div className="flex items-end gap-3">
                                                <span className={`text-4xl font-bold font-mono ${result.impact.service_delta_otd >= 0 ? 'text-green-glow' : 'text-red-critical'}`}>
                                                    {result.impact.service_delta_otd >= 0 ? '+' : ''}{result.impact.service_delta_otd.toFixed(1)}% OTD
                                                </span>
                                                <span className="text-white/30 text-sm pb-1">expectation</span>
                                            </div>
                                            <p className="text-xs text-white/50 mt-2">Net shift in expected on-time delivery</p>
                                        </GlassCard>
                                    </div>

                                    {/* Scored List */}
                                    <GlassCard className="p-6">
                                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6">New Top Recommended Carriers</h3>
                                        <div className="space-y-4">
                                            {result.scenario_top_5.map((carrier, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                                                    <div className="flex items-center gap-4">
                                                        <span className="w-8 h-8 rounded-full bg-blue-accent/20 flex items-center justify-center font-bold text-blue-accent">
                                                            {i + 1}
                                                        </span>
                                                        <div>
                                                            <h4 className="font-bold text-white">{carrier.carrier_name}</h4>
                                                            <div className="flex gap-3 mt-1 text-[10px] text-white/40 uppercase tracking-widest font-mono">
                                                                <span>OTD: {carrier.ontime_pct.toFixed(1)}%</span>
                                                                <span>Cost: ${carrier.cost_per_km.toFixed(2)}/km</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[10px] text-white/30 uppercase mb-1">Impact</div>
                                                        <div className={`text-xs font-bold ${carrier.original_rank > i + 1 ? 'text-green-glow' : carrier.original_rank < i + 1 ? 'text-red-critical' : 'text-white/40'}`}>
                                                            {carrier.original_rank > i + 1 ? `↑ Rose from #${carrier.original_rank}` :
                                                                carrier.original_rank < i + 1 ? `↓ Fell from #${carrier.original_rank}` :
                                                                    'Unchanged'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ) : (
                                <div className="h-[600px] border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center px-10">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-4xl mb-6 grayscale opacity-50">
                                        📡
                                    </div>
                                    <h3 className="text-2xl font-bold text-white/60 mb-3">Model Waiting for Scenario</h3>
                                    <p className="text-white/30 max-w-sm">
                                        Select a procurement scenario from the left panel to begin a simulation.
                                        The WHAT-IF modeler will re-rank 30 carriers in under 50ms.
                                    </p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
