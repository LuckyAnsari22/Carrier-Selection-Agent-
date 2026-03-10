import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useCarrierStore from '../../store/useCarrierStore'

const AGENT_META = {
  'Cost Optimizer': { color: '#F59E0B', icon: '💰', role: 'Financial Strategist' },
  'Reliability Guardian': { color: '#60A5FA', icon: '🛡️', role: 'Operations Auditor' },
  'Procurement Judge': { color: '#00FF88', icon: '⚖️', role: 'Arbitration Core' },
  'SHAP Explainer': { color: '#A78BFA', icon: '🔍', role: 'ML Interpretability' },
  'Risk Analyst': { color: '#FF2244', icon: '🚨', role: 'Anomaly Detection' }
}

export default function AgentDebateViewer() {
  const { agentMessages, isAnalyzing } = useCarrierStore()
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [agentMessages])

  return (
    <div className="glass-card p-6 h-full flex flex-col relative overflow-hidden">
      {/* HUD Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/[0.01] to-transparent bg-[length:100%_4px] opacity-20" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Agent Debate Protocol</h2>
          <p className="font-jetbrains-mono text-[9px] text-white/30 uppercase mt-1 tracking-widest">Multi-Agent Orchestration Layer</p>
        </div>

        {isAnalyzing && (
          <div className="flex items-center gap-2">
            <span className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ scaleY: [1, 2, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                  className="w-1 h-3 bg-green-glow rounded-full"
                />
              ))}
            </span>
            <span className="text-[10px] text-green-glow font-mono font-bold uppercase tracking-tighter ml-2">Processing Stream</span>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar relative z-10 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {agentMessages.map((msg, i) => {
            const meta = AGENT_META[msg.agent] || AGENT_META['Cost Optimizer']
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="group relative"
              >
                <div className="flex items-start gap-4">
                  {/* Agent Avatar */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border border-white/10 relative overflow-hidden"
                    style={{ background: `${meta.color}10`, color: meta.color }}
                  >
                    <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white to-transparent" />
                    {meta.icon}
                  </div>

                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.15em] font-space-grotesk">{msg.agent}</span>
                      <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">{meta.role}</span>
                      <span className="text-[8px] font-mono text-white/10 ml-auto">{new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}</span>
                    </div>

                    <div
                      className="p-4 rounded-2xl rounded-tl-none border border-white/5 bg-white/[0.02] group-hover:bg-white/[0.04] transition-colors relative"
                    >
                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 -translate-x-1 -translate-y-1" />
                      <p className="text-[12px] leading-relaxed text-white/80 font-jetbrains-mono whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {isAnalyzing && agentMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-6 opacity-30 mt-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              className="w-12 h-12 border-2 border-dashed border-blue-accent rounded-full"
            />
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-center">Synthesizing verdict across specialized model weights...</p>
          </div>
        )}

        {agentMessages.length === 0 && !isAnalyzing && (
          <div className="h-full flex flex-row items-center justify-center opacity-20 p-12 text-center gap-6">
            <div className="text-5xl">⚡</div>
            <p className="text-xs uppercase font-mono tracking-[0.2em] max-w-[200px] leading-relaxed">
              Initiate analysis protocol to observe multi-agent consensus logic.
            </p>
          </div>
        )}
      </div>

      {/* Decorative Command Line Text */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-3 opacity-20 select-none">
        <span className="text-green-glow text-[10px] font-bold">CARRIER_IQ_SHELL:~$</span>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-1.5 h-3 bg-white"
        />
      </div>
    </div>
  )
}
