'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from './useWebSocket';
import toast from 'react-hot-toast';

interface Alert {
  id: string;
  title: string;
  severity: string;
  message?: string;
  triggered_at: string;
}

export function useRealTimeAlerts() {
  const { socket, isConnected, subscribe } = useWebSocket(
    process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3002'
  );
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Subscribe to alerts room
    socket.emit('subscribe', 'alerts');

    // Listen for new alerts
    const unsubscribe = subscribe?.('alert:new', (alert: Alert) => {
      setAlerts((prev) => [alert, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast notification
      const emoji = getSeverityEmoji(alert.severity);
      toast(
        <div>
          <div className="font-bold">{emoji} {alert.title}</div>
          <div className="text-sm text-slate-400">{alert.message}</div>
        </div>,
        {
          duration: 5000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(0, 243, 255, 0.3)',
          },
        }
      );
    });

    // Request initial alerts
    socket.emit('request:alerts');
    socket.once('alerts:initial', (initialAlerts: Alert[]) => {
      setAlerts(initialAlerts);
    });

    return () => {
      socket.emit('unsubscribe', 'alerts');
      unsubscribe?.();
    };
  }, [socket, isConnected, subscribe]);

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  const clearAlerts = () => {
    setAlerts([]);
    setUnreadCount(0);
  };

  return { alerts, unreadCount, markAllAsRead, clearAlerts, isConnected };
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
