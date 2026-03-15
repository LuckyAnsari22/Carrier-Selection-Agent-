import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useCarrierStore from '../store/useCarrierStore'
import { getCarriers, scoreCarriers, streamAnalysis, createStreamTicket } from '../api/client'
import CarrierRankingPanel from '../components/dashboard/CarrierRankingPanel'
import AgentDebateViewer from '../components/dashboard/AgentDebateViewer'
import ExplainPanel from '../components/dashboard/ExplainPanel'
import WhatIfSimulator from '../components/dashboard/WhatIfSimulator'
import AnomalyAlert from '../components/dashboard/AnomalyAlert'
import LiveRiskBriefing from '../components/dashboard/LiveRiskBriefing'
import GlowButton from '../components/shared/GlowButton'

// High-end Typography & Layout Constants
const SECTION_TEXT = "font-space-grotesk tracking-tight"
const MONO_LABEL = "font-jetbrains-mono text-[10px] uppercase tracking-[0.2em]"

export default function Dashboard() {
  const {
    carriers, setCarriers,
    rankings, setRankings,
    isAnalyzing, setAnalyzing,
    priorities, addAgentMessage, clearAgentMessages,
    selectCarrier
  } = useCarrierStore()

  const [loadError, setLoadError] = useState(null)
  const [laneName] = useState('Mumbai → Delhi')

  // Fetch initial carriers and do a baseline score
  useEffect(() => {
    let isMounted = true
    const fetchInitialData = async () => {
      try {
        const response = await getCarriers()
        if (!isMounted) return

        const data = response.data
        setCarriers(data)

        // Initial quick score (non-streaming for speed)
        const scoreRes = await scoreCarriers(data, priorities, laneName)
        if (!isMounted) return

        setRankings(scoreRes.data)
        if (scoreRes.data.rankings?.length > 0) {
          selectCarrier(scoreRes.data.rankings[0])
        }
      } catch (err) {
        console.error("Dashboard Init Error:", err)
        if (isMounted) setLoadError(err.message)
      }
    }
    fetchInitialData()
    return () => { isMounted = false }
  }, [])

  const streamRef = useRef(null)

  // Fast, math-only recalculation for slider interactions
  const recalculateRankings = useCallback(async () => {
    if (carriers.length === 0) return
    try {
      const scoreRes = await scoreCarriers(carriers, priorities, laneName)
      setRankings(scoreRes.data)
      if (scoreRes.data.rankings?.length > 0) {
        selectCarrier(scoreRes.data.rankings[0])
      }
    } catch (err) {
      console.error("Fast Recalculation Error:", err)
    }
  }, [carriers, priorities, laneName, setRankings, selectCarrier])

  const handleAnalysis = useCallback(async () => {
    // Prevent overlapping streams 
    if (carriers.length === 0 || isAnalyzing) return

    console.log("🚀 Starting Carrier Analysis Protocol...")
    setAnalyzing(true)
    clearAgentMessages()

    if (streamRef.current) {
      streamRef.current.close()
    }

    try {
      // 1. Initial quick score
      const scoreRes = await scoreCarriers(carriers, priorities, laneName)
      setRankings(scoreRes.data)
      if (scoreRes.data.rankings?.length > 0) {
        selectCarrier(scoreRes.data.rankings[0])
      }

      // 2. Ticket-based stream initiation
      const ticketRes = await createStreamTicket(carriers, priorities, laneName)
      const ticketId = ticketRes.data.ticket_id

      // 3. Start SSE debate (Mocked if ticketId is mock)
      if (ticketId === 'mock-ticket-123') {
        const mockMessages = [
          { agent: 'Cost Optimizer', content: "Initial analysis of the Mumbai-Delhi corridor indicates that EliteShip Corp provides the best value-to-cost ratio..." },
          { agent: 'Reliability Guardian', content: "Confirmed. TransCo Express and EliteShip have maintained 98%+ OTD for the last 4 quarters..." },
          { agent: 'Procurement Judge', content: "Based on current priorities, EliteShip is the optimal strategic choice..." }
        ];
        
        for (const msg of mockMessages) {
          await new Promise(r => setTimeout(r, 1000));
          addAgentMessage(msg);
        }
        setAnalyzing(false);
        return;
      }

      const streamUrl = streamAnalysis(ticketId)
      const eventSource = new EventSource(streamUrl)
      streamRef.current = eventSource

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.agent && data.content) {
            addAgentMessage({ agent: data.agent, content: data.content })
          }
          if (data.type === 'complete') {
            console.log("✅ Analysis Complete")
            eventSource.close()
            setAnalyzing(false)
          }
        } catch (e) {
          console.error("Parse Error:", e)
        }
      }

      eventSource.onerror = (err) => {
        // Log more detail if possible
        if (eventSource.readyState === EventSource.CLOSED) {
          console.log("Stream closed by server or timeout.")
        } else {
          console.error("Stream Error Detail:", err)
        }
        eventSource.close()
        setAnalyzing(false)
      }

      // Safety timeout
      setTimeout(() => {
        if (eventSource.readyState !== EventSource.CLOSED) {
          console.warn("Closing stale stream after timeout.")
          eventSource.close()
          setAnalyzing(false)
        }
      }, 20000)

    } catch (err) {
      console.error("Critical Analysis Error:", err)
      setAnalyzing(false)
    }

  }, [carriers, priorities, laneName, setAnalyzing, clearAgentMessages, setRankings, selectCarrier, addAgentMessage])

  // Monitor priorities change - Trigger FAST mathematical scoring ONLY
  useEffect(() => {
    if (carriers.length > 0) {
      // Calculate TOPSIS + XGBoost instantly, but DO NOT run LLM agents on slider drag
      recalculateRankings()
    }
  }, [priorities, carriers.length, recalculateRankings])

  return (
    <div className="min-h-screen bg-space text-white pt-24 px-8 pb-12 relative">

      {/* Dynamic Header: High UI Density */}
      <header className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-8 mb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-3xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-green-glow/50" />
            <span className={`${MONO_LABEL} text-green-glow mt-1`}>Procurement Optimization Pipeline v3.2</span>
          </div>
          <h1 className={`${SECTION_TEXT} text-4xl md:text-5xl font-bold mb-4 leading-none`}>
            Strategic Carrier <span className="text-white/20">/</span> <span className="text-blue-accent">Selection Engine</span>
          </h1>
          <div className="flex flex-wrap items-center gap-6 mt-6">
            <div className="flex flex-col">
              <span className={MONO_LABEL}>Primary Lane</span>
              <span className="text-lg font-bold">{laneName}</span>
            </div>
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            <div className="flex flex-col">
              <span className={MONO_LABEL}>Sample Pool</span>
              <span className="text-lg font-bold text-white/70">{carriers.length} Multi-Modal Nodes</span>
            </div>
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            <div className="flex flex-col">
              <span className={MONO_LABEL}>Algorithmic Core</span>
              <span className="text-lg font-bold text-green-glow/80 underline decoration-green-glow/20 underline-offset-4">TOPSIS-XGB-Gemini</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-6"
        >
          <div className="text-right flex flex-col items-end">
            <span className={MONO_LABEL}>System Pulse</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-green-glow animate-pulse" />
              <span className="text-xs font-mono font-bold text-green-glow">OPTIMIZED</span>
            </div>
          </div>
          <GlowButton onClick={handleAnalysis} disabled={isAnalyzing || carriers.length === 0}>
            {isAnalyzing ? (
              <div className="flex items-center gap-2 px-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Running Agent Debate...</span>
              </div>
            ) : "Analyze Carriers"}
          </GlowButton>
        </motion.div>
      </header>

      {loadError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 glass-card border-red-critical/30 bg-red-critical/5 text-center flex items-center justify-center gap-4"
        >
          <span className="text-2xl">🚨</span>
          <div>
            <p className="font-bold text-red-critical uppercase tracking-widest text-xs mb-1">Critical Connection Error</p>
            <p className="text-white/60 text-sm">Target backend unreachable. Error: {loadError}</p>
          </div>
        </motion.div>
      )}

      {/* Grid: Hackathon Winner Pro Layout */}
      <div className="grid grid-cols-12 gap-8 relative z-10">

        {/* Col 1: Competitive Rankings (Index: 4) */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <section>
            <CarrierRankingPanel />
          </section>
          <section className="animate-float">
            <AnomalyAlert />
          </section>
        </div>

        {/* Col 2: Real-time Intelligence (Index: 5) */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
          <div className="flex flex-col h-full gap-8">
            <div className="h-[480px]">
              <AgentDebateViewer />
            </div>
            <div className="flex-1">
              <ExplainPanel />
            </div>
          </div>
        </div>

        {/* Col 3: Simulators & Feed (Index: 3) */}
        <div className="col-span-12 lg:col-span-3 space-y-8">
          <WhatIfSimulator />
          <LiveRiskBriefing />

          {/* Pro Market Ticker */}
          <div className="p-6 glass-card border-white/5 bg-white/1 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">📉</div>
            <h3 className={MONO_LABEL}>Global Market Context</h3>
            <div className="mt-6 space-y-5">
              {[
                { label: 'Diesel Index (DEL)', val: '₹92.4', delta: '+2.1%', up: true },
                { label: 'Port Delay (JNPT)', val: '3.2h', delta: '-0.5%', up: false },
                { label: 'Spot Rate Avg', val: '$1.82', delta: '+1.4%', up: true }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-end border-b border-white/5 pb-2">
                  <div>
                    <p className="text-[10px] text-white/30 uppercase font-mono">{item.label}</p>
                    <p className="text-sm font-bold mt-0.5">{item.val}</p>
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${item.up ? 'text-red-critical' : 'text-green-glow'}`}>
                    {item.up ? '▲' : '▼'} {item.delta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Space-level Decorative Elements */}
      <div className="fixed -bottom-60 -left-60 w-[600px] h-[600px] bg-green-glow/5 blur-[160px] rounded-full pointer-events-none z-0" />
      <div className="fixed top-20 right-[-100px] w-[500px] h-[500px] bg-blue-accent/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-40 right-40 w-[300px] h-[300px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none z-0" />
    </div>
  )
}
