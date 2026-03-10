import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useCarrierStore from '../../store/useCarrierStore';

const PRESETS = [
  'Best carrier today',
  'Current risks',
  'Top 3 now',
];

const RESPONSES = {
  'Best carrier today': {
    text: 'TransCo Premium leads with score 0.87. 97% on-time, capacity at 68%. The organism shows 4 healthy routes through this carrier. Recommended for award.',
    highlight: { type: 'best', ids: [0, 1] },
    mode: 'pulse',
  },
  'Current risks': {
    text: '3 critical alerts: BlueDart at 88% capacity. NH-48 disruption affects 2 carriers. Network concentration at 47% — diversification recommended.',
    highlight: { type: 'risks' },
    mode: 'risk',
  },
  'Top 3 now': {
    text: 'Number 1: TransCo Premium at 0.87. Number 2: RaasLogistics at 0.83. Number 3: BharatFreight at 0.79. All premium tier.',
    highlight: { type: 'top3', ids: [0, 1, 2] },
    mode: 'express',
  },
};

export default function VoiceOrb({ visible, onClose }) {
  const [status, setStatus] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const recogRef = useRef(null);
  const [lastQuery, setLastQuery] = useState('');

  const setVoiceHighlight = useCarrierStore((s) => s.setVoiceHighlight);
  const clearVoiceHighlight = useCarrierStore((s) => s.clearVoiceHighlight);
  const setNetworkMode = useCarrierStore((s) => s.setNetworkMode);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = true;
      recog.lang = 'en-US';
      recog.onstart = () => setStatus('listening');
      recog.onresult = (e) => {
        const text = Array.from(e.results).map(r => r[0].transcript).join('');
        setTranscript(text);
      };
      recog.onend = () => {
        setStatus('processing');
        processQuery(transcript || lastQuery);
      };
      recogRef.current = recog;
    }
  }, []);

  useEffect(() => {
    if (visible) {
      startListening();
    } else {
      setStatus('idle');
      setTranscript('');
    }
  }, [visible]);

  const startListening = () => {
    if (recogRef.current) {
      setTranscript('');
      recogRef.current.start();
    }
  };

  useEffect(() => {
    if (status === 'processing') {
      setNetworkMode('pulse');
    }
  }, [status]);

  const finish = () => {
    setStatus('idle');
    onClose && onClose();
    clearVoiceHighlight();
    setNetworkMode('normal');
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.9;
      utter.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.name.includes('Google UK English Female'));
      if (voice) utter.voice = voice;
      utter.onend = () => {
        setStatus('idle');
        setTimeout(finish, 300);
      };
      window.speechSynthesis.speak(utter);
    } else {
      finish();
    }
  };

  const handlePreset = (p) => {
    setTranscript(p);
    setStatus('processing');
    setLastQuery(p);
    processQuery(p);
  };

  const processQuery = (q) => {
    const cfg = RESPONSES[q] || { text: "Sorry I didn't understand.", highlight: null, mode: 'normal' };
    if (cfg.highlight) {
      setVoiceHighlight(cfg.highlight);
    }
    if (cfg.mode) {
      setNetworkMode(cfg.mode);
    }
    setStatus('speaking');
    speak(cfg.text);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="voice-orb-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`voice-orb ${status === 'listening' ? 'listening' : ''}`}
            animate={{ scale: status === 'processing' ? 1.2 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {[1,2,3].map(i => {
              let speed = '1.8s';
              if (status === 'listening') speed = '1s';
              if (status === 'speaking') speed = '1.2s';
              return <div key={i} className="voice-ring" style={{ animationDuration: speed }} />;
            })}
          </motion.div>
          <div className="mt-2 text-xs text-center text-brand-text w-64">
            {status === 'listening' && transcript}
            {status === 'processing' && 'Thinking...'}
          </div>
          <div className="mt-3 flex space-x-2">
            {PRESETS.map((p,i)=> (
              <button
                key={i}
                className="px-3 py-1 bg-brand-muted text-xs rounded hover:bg-brand-border"
                onClick={() => handlePreset(p)}
              >{p}</button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
