import React, { useState, useEffect, useRef } from 'react';
import { Microphone } from 'lucide-react';
import { motion } from 'framer-motion';

const PRESETS = [
  "Which carrier for Mumbai-Delhi today?",
  "What are the current risks?",
  "Show me the top 3 carriers"
];

export default function VoiceInterface() {
  const [listening, setListening] = useState(false);
  const [recognized, setRecognized] = useState('');
  const [processing, setProcessing] = useState(false);
  const [response, setResponse] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onstart = () => setListening(true);
      recog.onend = () => setListening(false);
      recog.onresult = (event) => {
        const text = Array.from(event.results)
          .map(r => r[0].transcript)
          .join('');
        setRecognized(text);
      };
      recognitionRef.current = recog;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setRecognized('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);
        const answer = "TransCo Premium is your top carrier today, scoring 0.87 out of 1. They have 97% on-time delivery and available capacity.";
        setResponse(answer);
        speak(answer);
      }, 1500);
    }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.9;
      utter.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.name.includes('Google UK English Female'));
      if (voice) utter.voice = voice;
      window.speechSynthesis.speak(utter);
    }
  };

  const handlePreset = (q) => {
    setRecognized(q);
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      const answer = "TransCo Premium is your top carrier today, scoring 0.87 out of 1. They have 97% on-time delivery and available capacity.";
      setResponse(answer);
      speak(answer);
    }, 1000);
  };

  return (
    <div className="p-4 flex flex-col items-center text-brand-text">
      <div className="relative">
        <button
          className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center relative"
          onClick={listening ? stopListening : startListening}
        >
          <Microphone className="w-8 h-8 text-white" />
        </button>
        {listening && (
          <span className="absolute inset-0 rounded-full border-4 border-brand-secondary animate-pulse"></span>
        )}
      </div>
      <div className="mt-2 text-sm">
        {listening ? 'Listening...' : processing ? 'Processing...' : 'Ask CarrierIQ'}
      </div>
      {listening && (
        <div className="mt-2 flex space-x-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 h-6 bg-brand-secondary"
              animate={{ height: [6, 20, 6] }}
              transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }}
            />
          ))}
        </div>
      )}
      {recognized && !processing && (
        <div className="mt-2 text-xs italic text-brand-dim">"{recognized}"</div>
      )}
      {response && (
        <div className="mt-3 w-full max-w-md bg-brand-card border-l-4 border-brand-primary p-2 text-sm">
          {response}
        </div>
      )}
      <div className="mt-4 flex space-x-2">
        {PRESETS.map((q, i) => (
          <button
            key={i}
            className="px-3 py-1 bg-brand-muted text-xs rounded hover:bg-brand-border"
            onClick={() => handlePreset(q)}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
