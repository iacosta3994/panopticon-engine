'use client';

import { useEffect, useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';

interface Alert {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: string;
  triggeredAt: Date;
}

const AlertsPanel = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/analysis/alerts?status=open');
        if (response.ok) {
          const data = await response.json();
          setAlerts(data.alerts.slice(0, 10));
        }
      } catch (error) {
        setAlerts(generateMockAlerts());
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);

    return () => clearInterval(interval);
  }, []);

  const generateMockAlerts = (): Alert[] => {
    return [
      {
        id: '1',
        title: 'High Error Rate Detected',
        severity: 'critical',
        status: 'open',
        triggeredAt: new Date(Date.now() - 300000),
      },
      {
        id: '2',
        title: 'Unusual API Latency',
        severity: 'high',
        status: 'open',
        triggeredAt: new Date(Date.now() - 900000),
      },
      {
        id: '3',
        title: 'Memory Usage Threshold',
        severity: 'medium',
        status: 'open',
        triggeredAt: new Date(Date.now() - 1800000),
      },
    ];
  };

  const severityColors = {
    critical: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400', dot: 'bg-red-500' },
    high: { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400', dot: 'bg-orange-500' },
    medium: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400', dot: 'bg-yellow-500' },
    low: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400', dot: 'bg-blue-500' },
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
            <FiAlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Active Alerts</h2>
            <p className="text-xs text-slate-400">Requires attention</p>
          </div>
        </div>
        <button className="px-3 py-1 text-xs bg-cyan-500/20 border border-cyan-500/30 rounded-md text-cyan-400 hover:bg-cyan-500/30 transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.map((alert) => {
          const colors = severityColors[alert.severity];
          
          return (
            <div
              key={alert.id}
              className={`p-4 ${colors.bg} border ${colors.border} rounded-lg hover:shadow-lg transition-all cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 ${colors.dot} rounded-full animate-pulse`}></span>
                  <span className={`text-xs font-semibold ${colors.text} uppercase`}>
                    {alert.severity}
                  </span>
                </div>
                <span className="text-xs text-slate-400 flex items-center space-x-1">
                  <FiClock className="w-3 h-3" />
                  <span>{getTimeAgo(alert.triggeredAt)}</span>
                </span>
              </div>
              <h3 className="text-sm font-medium text-white">{alert.title}</h3>
            </div>
          );
        })}
      </div>

      {alerts.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <FiCheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500 opacity-50" />
          <p>No active alerts</p>
          <p className="text-xs mt-1">All systems operational</p>
        </div>
      )}
    </div>
  );
};

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default AlertsPanel;
