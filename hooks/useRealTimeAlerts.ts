'use client';

import { useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import toast from 'react-hot-toast';
import { Alert } from '../src/lib/types';

export function useRealTimeAlerts() {
  const { connected, subscribe, on, off } = useWebSocket();

  useEffect(() => {
    if (connected) {
      subscribe('alerts');

      on('alert:new', (alert: Alert) => {
        // Show toast notification
        const emoji = getSeverityEmoji(alert.severity);
        
        toast.custom(
          <div className="bg-slate-800 border border-red-500/50 rounded-lg p-4 shadow-lg">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{emoji}</span>
              <div>
                <div className="font-semibold text-white">{alert.title}</div>
                <div className="text-sm text-slate-300 mt-1">{alert.message}</div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded text-red-400">
                    {alert.severity}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(alert.triggered_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>,
          {
            duration: 6000,
            position: 'top-right',
          }
        );
      });
    }

    return () => {
      if (connected) {
        off('alert:new');
      }
    };
  }, [connected]);
}

function getSeverityEmoji(severity: string): string {
  const emojis: Record<string, string> = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🔵',
    info: 'ℹ️',
  };
  return emojis[severity] || '⚠️';
}
