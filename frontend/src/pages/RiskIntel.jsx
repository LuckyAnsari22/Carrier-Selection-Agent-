import React from 'react';
import RiskIntelligence from '../components/RiskIntelligence';

export default function RiskIntel() {
  return (
    <div className="relative w-full h-full">
      <div className="fixed inset-0 bg-black opacity-30 pointer-events-none z-0" />
      <div className="relative z-10 p-6">
        <RiskIntelligence />
      </div>
    </div>
  );
}
