'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import logger from '../src/lib/logger';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    try {
      const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3002', {
        auth: {
          token: localStorage.getItem('auth_token') || '',
        },
        reconnection: options.reconnect !== false,
      });

      newSocket.on('connect', () => {
        setConnected(true);
        setError(null);
        console.log('WebSocket connected');
      });

      newSocket.on('disconnect', () => {
        setConnected(false);
        console.log('WebSocket disconnected');
      });

      newSocket.on('connect_error', (err) => {
        setError(err.message);
        console.error('WebSocket connection error:', err);
      });

      setSocket(newSocket);
    } catch (err: any) {
      setError(err.message);
    }
  }, [options.reconnect]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
    }
  }, [socket]);

  const subscribe = useCallback((room: string) => {
    if (socket && connected) {
      socket.emit('subscribe', room);
    }
  }, [socket, connected]);

  const unsubscribe = useCallback((room: string) => {
    if (socket && connected) {
      socket.emit('unsubscribe', room);
    }
  }, [socket, connected]);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  }, [socket]);

  const off = useCallback((event: string) => {
    if (socket) {
      socket.off(event);
    }
  }, [socket]);

  const emit = useCallback((event: string, data: any) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  }, [socket, connected]);

  useEffect(() => {
    if (options.autoConnect !== false) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [options.autoConnect]);

  return {
    socket,
    connected,
    error,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    on,
    off,
    emit,
  };
}
