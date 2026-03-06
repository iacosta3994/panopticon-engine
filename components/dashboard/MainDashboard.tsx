'use client';

import { useEffect, useState } from 'react';
import MetricsOverview from './MetricsOverview';
import AnomalyVisualization from './AnomalyVisualization';
import PatternVisualization from './PatternVisualization';
import AlertsPanel from './AlertsPanel';
import TemporalAnalysis from './TemporalAnalysis';
import { FiActivity, FiAlertCircle, FiTrendingUp, FiEye } from 'react-icons/fi';

const MainDashboard = () => {
  const [stats, setStats] = useState({
    observations: 0,
    activeAlerts: 0,
    patterns: 0,
    dataSources: 0,
  });

  useEffect(() => {
    // Fetch dashboard statistics
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Update every 10s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
          Surveillance Overview
        </h1>
        <p className="text-slate-400 mt-1">Real-time monitoring and intelligence dashboard</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FiActivity}
          label="Observations"
          value={stats.observations.toLocaleString()}
          change="+12.5%"
          trend="up"
          color="cyan"
        />
        <StatCard
          icon={FiAlertCircle}
          label="Active Alerts"
          value={stats.activeAlerts.toString()}
          change="-3"
          trend="down"
          color="yellow"
        />
        <StatCard
          icon={FiEye}
          label="Patterns Detected"
          value={stats.patterns.toString()}
          change="+5"
          trend="up"
          color="purple"
        />
        <StatCard
          icon={FiTrendingUp}
          label="Data Sources"
          value={stats.dataSources.toString()}
          change="100%"
          trend="stable"
          color="green"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <MetricsOverview />
          <TemporalAnalysis />
          <AnomalyVisualization />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          <AlertsPanel />
          <PatternVisualization />
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  color: 'cyan' | 'yellow' | 'purple' | 'green';
}

const StatCard = ({ icon: Icon, label, value, change, trend, color }: StatCardProps) => {
  const colorClasses = {
    cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-400',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    stable: '→',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur border rounded-xl p-6 hover:shadow-cyber transition-all`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8" />
        <span className="text-sm font-mono">{trendIcons[trend]} {change}</span>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
};

export default MainDashboard;
