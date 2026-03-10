import React from 'react';
import AgentPipeline from '../components/AgentPipeline';

export default function Pipeline() {
  return (
    <div className="relative w-full h-full">
      <div className="fixed inset-0 bg-black opacity-30 pointer-events-none z-0" />
      <div className="relative z-10 p-6">
        <AgentPipeline orientation="vertical" />
      </div>
    </div>
  );
}
