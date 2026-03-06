'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiCheck, FiX } from 'react-icons/fi';
import { useRealTimeAlerts } from '@/hooks/useRealTimeAlerts';
import toast from 'react-hot-toast';

interface Alert {
  id: string;
  title: string;
  severity: string;
  status: string;
  triggered_at: string;
  message?: string;
}

const AlertsPanel = () => {
  const { alerts, unreadCount, markAllAsRead, isConnected } = useRealTimeAlerts();
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const filteredAlerts = selectedSeverity === 'all'
    ? alerts
    : alerts.filter(a => a.severity === selectedSeverity);

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'border-red-500 bg-red-500/10',
      high: 'border-orange-500 bg-orange-500/10',
      medium: 'border-yellow-500 bg-yellow-500/10',
      low: 'border-blue-500 bg-blue-500/10',
      info: 'border-slate-500 bg-slate-500/10',
    };
    return colors[severity] || colors.info;
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/analysis/alerts/${alertId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'acknowledged', acknowledged_by: 'admin' }),
      });

      if (response.ok) {
        toast.success('Alert acknowledged');
      }
    } catch (error) {
      toast.error('Failed to acknowledge alert');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6 flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Active Alerts</h2>
          <p className="text-sm text-slate-400 mt-1">Requires attention</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-3 py-1 rounded-lg transition-colors"
          >
            Mark {unreadCount} as read
          </button>
        )}
      </div>

      {/* Severity Filter */}
      <div className="flex space-x-2 mb-4">
        {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
          <button
            key={severity}
            onClick={() => setSelectedSeverity(severity)}
            className={`px-3 py-1 rounded-lg text-xs transition-all ${
              selectedSeverity === severity
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {severity.charAt(0).toUpperCase() + severity.slice(1)}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {filteredAlerts.length === 0 ? (
          <div className="text-sm text-slate-500 text-center py-8">
            No {selectedSeverity !== 'all' ? selectedSeverity : ''} alerts
          </div>
        ) : (
          filteredAlerts.slice(0, 10).map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} hover:shadow-lg transition-all`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <FiAlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="font-semibold text-sm">{alert.title}</span>
                  </div>
                  {alert.message && (
                    <p className="text-xs text-slate-400 mb-2">{alert.message}</p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span>{new Date(alert.triggered_at).toLocaleString()}</span>
                    <span className="px-2 py-0.5 bg-slate-800 rounded">{alert.severity}</span>
                  </div>
                </div>
                <div className="flex space-x-1 ml-2">
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="p-1.5 hover:bg-green-500/20 rounded transition-colors"
                    title="Acknowledge"
                  >
                    <FiCheck className="w-4 h-4 text-green-400" />
                  </button>
                  <button
                    className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                    title="Dismiss"
                  >
                    <FiX className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default AlertsPanel;
