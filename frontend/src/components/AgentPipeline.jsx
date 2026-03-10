import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2, Activity, Database, Zap, Shield, BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const agents = [
  { key: 'intake', name: 'INTAKE', tool: 'API' },
  { key: 'intel', name: 'INTEL AGENT', tool: 'Exa AI' },
  { key: 'risk', name: 'RISK ORACLE', tool: 'XGBoost' },
  { key: 'decision', name: 'DECISION ENGINE', tool: 'TOPSIS' },
  { key: 'shield', name: 'RISK SHIELD', tool: 'Rules' },
  { key: 'explainer', name: 'EXPLAINER', tool: 'SHAP' },
  { key: 'audit', name: 'AUDIT AGENT', tool: 'Logger' }
];

export default function AgentPipeline() {
  const [statuses, setStatuses] = useState(agents.map(() => 'idle'));
  const [logLines, setLogLines] = useState([]);
  const [running, setRunning] = useState(false);
  const [metrics, setMetrics] = useState({ total: 0, calls: 0 });

  const appendLog = (line) => {
    setLogLines(prev => [...prev, line]);
  };

  const runSequence = () => {
    if (running) return;
    setRunning(true);
    setLogLines([]);
    setMetrics({ total: 0, calls: 0 });
    let elapsed = 0;
    agents.forEach((agent, idx) => {
      const start = idx * 500 + 200;
      setTimeout(() => {
        setStatuses(s => {
          const arr = [...s];
          arr[idx] = 'running';
          return arr;
        });
        appendLog(`${new Date().toLocaleTimeString()} | ${agent.key}: started`);
      }, start);
      const duration = 300 + Math.random() * 500;
      setTimeout(() => {
        setStatuses(s => {
          const arr = [...s];
          arr[idx] = 'done';
          return arr;
        });
        elapsed += duration;
        setMetrics(m => ({ total: elapsed, calls: m.calls + 1 }));
        appendLog(`${new Date().toLocaleTimeString()} | ${agent.key}: ${agent.tool} → done (${Math.round(duration)}ms)`);
        if (idx === agents.length - 1) {
          setLogLines(prev => [...prev, `${new Date().toLocaleTimeString()} | pipeline complete | top carrier: TransCo Premium | total: ${Math.round(elapsed)}ms`]);
          setRunning(false);
        }
      }, start + duration);
    });
  };

  return (
    <div className="p-4 space-y-6 text-brand-text">
      {/* pipeline nodes */}
      <div className="flex items-center justify-between overflow-x-auto">
        {agents.map((agent, idx) => (
          <React.Fragment key={agent.key}>
            <div className="flex flex-col items-center">
              <div className={`w-32 p-2 rounded-md border ${
                statuses[idx] === 'idle' ? 'border-gray-600' :
                statuses[idx] === 'running' ? 'border-cyan-400 animate-pulse' :
                'border-green-400'
              } bg-brand-card`}>                
                <div className="text-xs font-semibold">{agent.name}</div>
                <div className="text-[10px] text-brand-dim">{agent.tool}</div>
                <div className="mt-1 text-xs font-mono">
                  {statuses[idx] === 'running' ? <Loader2 className="w-4 h-4 animate-spin inline" /> :
                    statuses[idx] === 'done' ? <CheckCircle className="w-4 h-4 inline text-green-400" /> :
                    <Activity className="w-4 h-4 inline text-gray-500" />}
                </div>
              </div>
              {idx < agents.length - 1 && (
                <ArrowRight className="w-6 h-6 text-brand-dim mx-2" />
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
      <button
        className="px-4 py-2 bg-brand-primary text-white rounded hover:opacity-90"
        onClick={runSequence}
        disabled={running}
      >
        {running ? 'Running...' : 'Run Pipeline'}
      </button>
      {/* bottom section */}
      <div className="flex space-x-4">
        {/* traces */}
        <div className="w-1/2 glass-card p-4 overflow-y-auto h-48">
          <div className="font-bold mb-2">LANGFUSE LIVE TRACES</div>
          <div className="text-xs font-mono text-green-400">
            {logLines.map((line, i) => (
              <div key={i} className="leading-tight">{line}</div>
            ))}
          </div>
          <div className="mt-2 text-right">
            <a href="https://langfuse.com" className="text-xs text-brand-primary underline">View Full Traces →</a>
          </div>
        </div>
        {/* metrics */}
        <div className="w-1/2 glass-card p-4">
          <div className="font-bold mb-2">PERFORMANCE METRICS</div>
          <div className="text-sm space-y-1">
            <div>Total pipeline time: {Math.round(metrics.total)}ms</div>
            <div>vs Monte Carlo equivalent: 300,000ms</div>
            <div>Speedup: {metrics.total ? Math.round(300000 / metrics.total) : '--'}x</div>
            <div>API calls made: {metrics.calls}</div>
            <div>Total cost: $0.004</div>
            <div>Model confidence: 94.2%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
