'use client';

import { useEffect, useState } from 'react';
import { useAlertStore } from '@/store/alertStore';
import { FiAlertCircle, FiCheckCircle, FiClock, FiX } from 'react-icons/fi';
import { Alert } from '@/src/lib/types';

export default function AlertsPage() {
  const { alerts, setAlerts, getFilteredAlerts } = useAlertStore();
  const [filter, setFilter] = useState<'all' | 'open' | 'acknowledged' | 'resolved'>('all');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/analysis/alerts');
        if (response.ok) {
          const data = await response.json();
          setAlerts(data.alerts);
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      }
    };

    fetchAlerts();
  }, [setAlerts]);

  const filteredAlerts = filter === 'all'
    ? alerts
    : alerts.filter(a => a.status === filter);

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await fetch(`http://localhost:3001/api/analysis/alerts/${alertId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'acknowledged',
          acknowledged_by: 'dashboard_user',
        }),
      });
      
      // Update local state
      setAlerts(alerts.map(a => 
        a.id === alertId ? { ...a, status: 'acknowledged' as any } : a
      ));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-orange-500 to-yellow-600 bg-clip-text text-transparent">
            Alert Management
          </h1>
          <p className="text-slate-400 mt-1">Monitor and manage system alerts</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {(['all', 'open', 'acknowledged', 'resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-2 text-xs opacity-60">
              ({f === 'all' ? alerts.length : alerts.filter(a => a.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-slate-900/50 backdrop-blur border border-slate-800 hover:border-slate-700 rounded-xl p-6 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  alert.severity === 'critical' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                  alert.severity === 'high' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                  alert.severity === 'medium' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                  'bg-gradient-to-br from-blue-500 to-blue-600'
                }`}>
                  <FiAlertCircle className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded font-medium uppercase ${
                      alert.severity === 'critical' ? 'bg-red-500/20 border border-red-500/50 text-red-400' :
                      alert.severity === 'high' ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400' :
                      alert.severity === 'medium' ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400' :
                      'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-300 mb-3">{alert.message || 'No additional details'}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <div className="flex items-center space-x-1">
                      <FiClock className="w-3 h-3" />
                      <span>Triggered {getTimeAgo(new Date(alert.triggered_at))}</span>
                    </div>
                    <div>•</div>
                    <div>Type: {alert.alert_type}</div>
                    <div>•</div>
                    <div>Status: {alert.status}</div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center space-x-2">
                {alert.status === 'open' && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-green-400 text-sm transition-all"
                  >
                    <FiCheckCircle className="w-4 h-4 inline mr-2" />
                    Acknowledge
                  </button>
                )}
                <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                  <FiX className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-12 text-center">
          <FiCheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500 opacity-50" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">No Alerts</h3>
          <p className="text-slate-400">All systems are operating normally</p>
        </div>
      )}
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
