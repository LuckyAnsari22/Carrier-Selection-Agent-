import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import SupplyChainGlobe from '../components/3d/SupplyChainGlobe'
import GlassCard from '../components/shared/GlassCard'
import GlowButton from '../components/shared/GlowButton'

const FEATURES = [
  { title: 'The Core Debate', desc: 'Cost Optimizer, Reliability Guardian, and Procurement Judge debate every bid before a final verdict is issued.', icon: '⚖️', color: '#00FF88' },
  { title: 'Bid Normalization', desc: 'Expert Agent normalizes raw, unstructured carrier emails into strict JSON arrays using LLM reasoning.', icon: '📋', color: '#60A5FA' },
  { title: 'What-If Engine', desc: 'Scenario Modeler re-ranks carriers using TOPSIS math, generating instant financial impact reports.', icon: '🧪', color: '#A78BFA' },
  { title: 'MLOps Self-Healing', desc: 'Feedback Analyst Agent tracks SQLite databases to detect XGBoost model drift and human override bias.', icon: '🧠', color: '#FF2244' },
]

const AGENTS = [
  { name: 'Cost Optimizer', role: 'Analyzes fuel accessorials & base rates', tab: 'Monitor', path: '/dashboard' },
  { name: 'Reliability Guardian', role: 'Vetoes risky carriers based on variance', tab: 'Monitor', path: '/dashboard' },
  { name: 'Procurement Judge', role: 'Synthesizes debate & finalizes allocation', tab: 'Monitor', path: '/dashboard' },
  { name: 'SHAP Explainer', role: 'Translates XGBoost math to English', tab: 'Monitor', path: '/dashboard' },
  { name: 'Live Risk Researcher', role: 'Pulls real-time anomaly alerts', tab: 'Briefing', path: '/summary' },
  { name: 'Bid Normalizer', role: 'Parses unstructured human emails', tab: 'Bids', path: '/normalize' },
  { name: 'What-If Strategist', role: 'Models financial impact of scenarios', tab: 'Simulate', path: '/whatif' },
  { name: 'Executive Summarizer', role: 'Produces C-Suite state-of-network reports', tab: 'Briefing', path: '/summary' },
  { name: 'Feedback Analyst', role: 'Tracks model drift & human bias', tab: 'MLOps', path: '/feedback-loop' },
  { name: 'Financial Auditor', role: 'Analyzes Altman Z-scores for bankruptcy', tab: 'Audit', path: '/financial-health' },
  { name: 'Network Strategist', role: 'Optimizes volume across multiple lanes', tab: 'Portfolio', path: '/award-strategy' },
  { name: 'QBR Generator', role: 'Automates 90-day performance reviews', tab: 'QBR', path: '/qbr' }
]

export default function Landing() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef })

  // Custom spring scroll for smoothness
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  const healthScore = useTransform(smoothProgress, [0, 0.4, 0.6], [100, 15, 95])
  const [currentHealth, setCurrentHealth] = useState(100)

  useEffect(() => {
    return healthScore.on('change', (v) => setCurrentHealth(v))
  }, [healthScore])

  // Parallax effects
  const globeOpacity = useTransform(smoothProgress, [0, 0.8, 1], [1, 0.5, 0])
  const globeScale = useTransform(smoothProgress, [0, 0.4, 0.7], [1, 0.8, 1.2])
  const globeY = useTransform(smoothProgress, [0, 1], [0, 200])

  return (
    <div ref={containerRef} className="relative bg-[#030712] overflow-x-hidden selection:bg-green-glow/30 selection:text-white">

      {/* Hero Section: The Soul of the App */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6">

        {/* Sticky 3D Background */}
        <motion.div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{ opacity: globeOpacity, scale: globeScale, y: globeY }}
        >
          <SupplyChainGlobe healthScore={currentHealth} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl"
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="h-[1px] w-12 bg-white/20" />
            <p className="text-green-glow font-mono text-[10px] uppercase tracking-[0.4em] mt-1 px-4 border border-green-glow/20 py-2 rounded-full bg-green-glow/5 backdrop-blur-md">
              The Next Gen Procurement Stack
            </p>
            <span className="h-[1px] w-12 bg-white/20" />
          </div>

          <h1 className="text-7xl md:text-9xl font-bold text-white mb-8 tracking-tighter leading-[0.85]">
            A 12-Agent<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-glow via-blue-accent to-purple-500">
              Procurement Brain.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Don't just wrap an LLM prompt. CarrierIQ v3 orchestrates an entire society of 12 distinct AI agents, backed by real XGBoost & TOPSIS mathematics, to automate enterprise logistics.
          </p>

          <GlowButton onClick={() => navigate('/dashboard')} className="group">
            <span className="flex items-center gap-2">
              Launch Intelligence Engine
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.span>
            </span>
          </GlowButton>
        </motion.div>

        {/* Animated Scroll Badge */}
        <motion.div
          className="absolute bottom-10 flex flex-col items-center gap-4 text-white/20"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          <span className="text-[10px] font-mono uppercase tracking-[0.5em] writing-mode-vertical">Explore The Depth</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
      </section>

      {/* Technical Maturity Section */}
      <section className="relative z-10 min-h-screen py-32 px-10 md:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ margin: "-200px" }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
              AHP Matrix Meets<br />
              <span className="text-orange-warn">Active Reasoning.</span>
            </h2>
            <div className="space-y-8 mt-12">
              {[
                { label: 'Decision Velocity', val: '9.4x Faster', desc: 'Automated normalization of multi-modal bids.' },
                { label: 'Risk Mitigation', val: '43% Reduction', desc: 'Isolation forest flags anomalies before award.' },
                { label: 'System Visibility', val: '100% Explainable', desc: 'Every model output is backed by SHAP weights.' }
              ].map((stat, i) => (
                <div key={i} className="group border-b border-white/5 pb-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-2xl font-bold group-hover:text-green-glow transition-colors">{stat.val}</span>
                    <span className="text-xs font-mono text-white/20 uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <p className="text-sm text-white/40 font-light">{stat.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* The 12 Agent Ecosystem Section */}
      <section className="relative z-10 min-h-screen py-32 px-10 md:px-24 bg-white/[0.01]">
        <div className="text-center mb-24">
          <p className="text-green-glow font-mono text-sm uppercase tracking-widest mb-4">Unprecedented Scale</p>
          <h2 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
            The 12-Agent Ecosystem.
          </h2>
          <p className="text-xl text-white/40 max-w-3xl mx-auto mt-6 font-light">
            While competitors hardcode a single prompt, you deploy an entire digital procurement department. 12 autonomous experts working in parallel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {AGENTS.map((agent, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => navigate(agent.path)}
              className="glass-card p-6 border-white/5 hover:border-green-glow/50 transition-all group overflow-hidden relative cursor-pointer flex flex-col justify-between min-h-[160px]"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full pointer-events-none" />
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-green-glow opacity-50">Agent 0{i + 1}</span>
                  <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-white/50 group-hover:bg-blue-accent/20 group-hover:text-blue-accent transition-colors">{agent.tab}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-green-glow transition-colors">{agent.name}</h3>
                <p className="text-xs text-white/40 leading-relaxed font-light mb-4">{agent.role}</p>
              </div>
              <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 transform duration-300">
                <span className="text-xs font-bold text-green-glow flex items-center gap-1">
                  Launch Agent <span>→</span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid: The Hackathon Winner Cards */}
      <section className="relative z-10 py-32 px-10 md:px-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-24"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Built for Enterprise Rigor.</h2>
          <p className="text-xl text-white/40 max-w-2xl mx-auto font-light">
            Every feature designed to satisfy C-level visibility and supply chain auditor scrutiny.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.8 }}
              className="group p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 text-left hover:border-white/10 hover:-translate-y-2 overflow-hidden relative"
            >
              <div
                className="absolute -right-4 -bottom-4 w-24 h-24 blur-[40px] opacity-10 transition-opacity group-hover:opacity-40"
                style={{ backgroundColor: f.color }}
              />
              <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform duration-500">{f.icon}</div>
              <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{f.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed font-light">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="relative z-10 min-h-[60vh] flex flex-col items-center justify-center text-center px-10 py-32">
        <div className="absolute inset-0 bg-gradient-to-t from-green-glow/5 via-transparent to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
        >
          <h2 className="text-6xl md:text-8xl font-bold mb-8 leading-none">
            Ready to Scale.<br />
            <span className="text-white/20 uppercase font-mono text-3xl tracking-[0.5em] block mt-8">CarrierIQ Multi-Agent</span>
          </h2>
          <GlowButton onClick={() => navigate('/dashboard')} className="mt-12 px-12 py-5 text-xl">
            Enter Dashboard Stack →
          </GlowButton>
        </motion.div>
      </section>

      {/* Footer Meta */}
      <footer className="relative z-10 py-12 px-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center bg-transparent backdrop-blur-xl">
        <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
          Gemini 2.5 Flash | 12-Agent Orchestration | CarrierIQ v3
        </p>
      </footer>
    </div>
  )
}
