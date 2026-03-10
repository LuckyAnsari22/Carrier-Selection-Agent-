import { create } from 'zustand'

const useCarrierStore = create((set) => ({
  // State
  carriers: [],
  rankings: null,
  selectedCarrier: null,
  isAnalyzing: false,
  agentMessages: [],
  priorities: { cost: 0.40, reliability: 0.35, speed: 0.15, quality: 0.10 },
  scenario: 'BASELINE',
  shapData: null,
  riskBriefing: null,
  anomalies: [],

  // Actions
  setCarriers: (carriers) => set({ carriers }),
  setRankings: (rankings) => set({ rankings }),
  selectCarrier: (carrier) => set({ selectedCarrier: carrier }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  addAgentMessage: (msg) => set(state => {
    const lastMsg = state.agentMessages[state.agentMessages.length - 1];
    if (lastMsg && lastMsg.agent === msg.agent) {
      // Append content to existing message for smooth streaming
      const updatedMessages = [...state.agentMessages];
      updatedMessages[updatedMessages.length - 1] = {
        ...lastMsg,
        content: lastMsg.content + msg.content
      };
      return { agentMessages: updatedMessages };
    }
    // New message if agent changed
    return { agentMessages: [...state.agentMessages, msg] };
  }),
  clearAgentMessages: () => set({ agentMessages: [] }),
  setPriorities: (priorities) => set({ priorities }),
  setScenario: (scenario) => set({ scenario }),
  setShapData: (shapData) => set({ shapData }),
  setRiskBriefing: (riskBriefing) => set({ riskBriefing }),
  setAnomalies: (anomalies) => set({ anomalies }),
  reset: () => set({
    rankings: null, selectedCarrier: null, isAnalyzing: false, agentMessages: []
  }),
}))

export default useCarrierStore
