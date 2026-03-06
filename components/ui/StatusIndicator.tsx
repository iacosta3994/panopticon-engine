'use client';

import { useEffect, useState } from 'react';

const StatusIndicator = () => {
  const [status, setStatus] = useState<'healthy' | 'degraded' | 'error'>('healthy');
  const [metrics, setMetrics] = useState({
    observations: 0,
    alerts: 0,
    health: 100,
  });

  useEffect(() => {
    // Fetch system status
    const fetchStatus = async () => {
      try {
        const response = await fetch('http://localhost:3001/health');
        if (response.ok) {
          setStatus('healthy');
        }
      } catch (error) {
        setStatus('error');
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const statusColors = {
    healthy: 'bg-green-500',
    degraded: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  const statusText = {
    healthy: 'All Systems Operational',
    degraded: 'Performance Degraded',
    error: 'System Error',
  };

  return (
    <div className="h-10 bg-slate-900/30 border-b border-slate-800/50 flex items-center justify-between px-6 text-xs">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${statusColors[status]} animate-pulse`}></span>
          <span className="text-slate-400">{statusText[status]}</span>
        </div>
        
        <div className="h-4 w-px bg-slate-700"></div>
        
        <div className="text-slate-400">
          Observations: <span className="text-cyan-400 font-mono">{metrics.observations.toLocaleString()}</span>
        </div>
        
        <div className="text-slate-400">
          Active Alerts: <span className="text-yellow-400 font-mono">{metrics.alerts}</span>
        </div>
        
        <div className="text-slate-400">
          System Health: <span className="text-green-400 font-mono">{metrics.health}%</span>
        </div>
      </div>
      
      <div className="text-slate-500">
        Last Update: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default StatusIndicator;
