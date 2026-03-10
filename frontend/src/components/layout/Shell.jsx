import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Microphone } from 'lucide-react';

const Shell = ({
  children,
  leftPanel = null,
  rightPanel = null,
  selectedCarrier = null,
  lane = 'Mumbai → Delhi',
  onLaneSwap = () => {},
  live = true,
  agents = 7,
  r2 = 0.94,
  voiceActive = false,
  onMicToggle = () => {},
}) => {
  const headerRef = useRef();
  const leftRef = useRef();

  useEffect(() => {
    if (leftRef.current) {
      gsap.fromTo(
        leftRef.current.children,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
      );
    }

    const handleScroll = () => {
      const y = window.scrollY;
      gsap.to(headerRef.current, { y: Math.min(y * 0.02, 4), duration: 0.3 });
    };
    window.addEventListener('scroll', handleScroll);

    // custom neon cursor elements
    const dot = document.createElement('div');
    dot.id = 'cursor-dot';
    const ring = document.createElement('div');
    ring.id = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    const move = (e) => {
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0 });
      gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0 });
    };
    const down = () => gsap.to(ring, { scale: 0.8, duration: 0.15 });
    const up = () => gsap.to(ring, { scale: 1, duration: 0.15 });
    window.addEventListener('mousemove', move);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
      dot.remove();
      ring.remove();
    };
  }, []);

  return (
    <div className="relative w-full h-full z-10">
      <div
        ref={headerRef}
        className="absolute top-5 left-1/2 transform -translate-x-1/2"
      >
        <div className="glass-card px-6 py-2 flex items-center space-x-4 max-w-xl w-full">
          <div className="font-bebas text-[22px]">
            <span>CARRIER</span>
            <span className="text-ice">IQ</span>
          </div>
          <div className="flex-1 text-center text-xs">
            {lane} <button onClick={onLaneSwap} className="ml-2">🔁</button>
          </div>
          <div className="flex space-x-2 items-center text-xs">
            {live && (
              <span className="px-2 py-1 bg-ice text-void rounded-full">LIVE</span>
            )}
            <span className="px-2 py-1 bg-neon text-void rounded-full">{agents} AGENTS</span>
            <span className="px-2 py-1 bg-plasma text-void rounded-full">R² {r2}</span>
            <button
              onClick={onMicToggle}
              className={`p-1 rounded-full ${voiceActive ? 'bg-neon' : 'hover:bg-brand-border'}`}
            >
              <Microphone className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={leftRef}
        className="absolute top-24 left-6 w-[280px] space-y-4"
      >
        {leftPanel}
      </div>

      <div className="absolute top-24 right-6 w-[280px] space-y-4">
        {rightPanel}
      </div>

      <div className="hud pointer-events-none">
        <div className="ring r1" />
        <div className="ring r2" />
        <div className="ring r3" />
        <div className="crosshair h" />
        <div className="crosshair v" />
        <div className="hud-label">
          SUPPLY CHAIN ORGANISM · 30 CARRIERS · LIVE
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full flex items-center justify-between text-xs px-4 h-7 glass-card">
        <div>● 30 Carriers · 7 Agents · LangGraph</div>
        <div>XGBoost · AHP-TOPSIS · SHAP · Langfuse · Exa AI</div>
        <div>LoRRI 2026 · PS1 · Team Outliers</div>
      </div>

      {children}
    </div>
  );
};

export default Shell;
