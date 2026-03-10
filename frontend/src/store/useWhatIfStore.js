import { create } from 'zustand';

const useWhatIfStore = create((set) => ({
  weights: { cost: 35, reliability: 30, speed: 20, quality: 15 },
  isComputing: false,
  computeMs: 0,

  networkMode: 'normal',
  previousMode: 'normal',
  bpm: 60,
  setNetworkMode: (mode) =>
    set((state) => {
      const prev = state.networkMode;
      let bpm = 60;
      if (mode === 'pulse' && prev === 'risk') bpm = 72;
      return { networkMode: mode, previousMode: prev, bpm };
    }),

  updateWeight: (field, value) => {
    set((state) => {
      const newW = { ...state.weights, [field]: value };
      return { weights: newW, isComputing: true };
    });
    const ms = Math.floor(38 + Math.random() * 16);
    setTimeout(() => set({ isComputing: false, computeMs: ms }), 180);
  },
  applyPreset: (cfg) => {
    set({ weights: cfg, isComputing: true });
    const ms = Math.floor(38 + Math.random() * 16);
    setTimeout(() => set({ isComputing: false, computeMs: ms }), 180);
  },

  // voice/organism highlight
  voiceHighlight: null,
  setVoiceHighlight: (hl) => set({ voiceHighlight: hl }),
  clearVoiceHighlight: () => set({ voiceHighlight: null }),

  // hover highlight
  hoveredCarrier: null,
  setHoveredCarrier: (id) => set({ hoveredCarrier: id }),
  clearHoveredCarrier: () => set({ hoveredCarrier: null }),
}));

export default useWhatIfStore;
