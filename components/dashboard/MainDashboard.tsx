'use client';

import { useEffect, useState } from 'react';
import MetricsOverview from './MetricsOverview';
import AnomalyDisplay from './AnomalyDisplay';
import PatternVisualization from './PatternVisualization';
import AlertsPanel from './AlertsPanel';
import TimelineView from './TimelineView';
import { useLiveData } from '@/hooks/useLiveData';

const MainDashboard = () => {
  const [stats, setStats] = useState({
    observations: 0,
    activeAlerts: 0,
    patterns: 0,
    health: 100,
  });

  useEffect(() => {
    // Fetch initial stats
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats({
            observations: data.observations,
            activeAlerts: data.active_alerts,
            patterns: data.patterns,
            health: 98.5,
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Surveillance Overview
          </h1>
          <p className="text-slate-400 mt-1">Real-time system monitoring and analysis</p>
        </div>
        <div className="flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-4 py-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-cyan-400 text-sm font-medium">All Systems Active</span>
        </div>
      </div>

      {/* Metrics Overview */}
      <MetricsOverview stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomaly Display */}
        <div className="lg:col-span-1">
          <AnomalyDisplay />
        </div>

        {/* Alerts Panel */}
        <div className="lg:col-span-1">
          <AlertsPanel />
        </div>
      </div>

      {/* Pattern Visualization */}
      <div className="grid grid-cols-1 gap-6">
        <PatternVisualization />
      </div>

      {/* Timeline View */}
      <div className="grid grid-cols-1 gap-6">
        <TimelineView />
      </div>
    </div>
  );
};

export default MainDashboard;
