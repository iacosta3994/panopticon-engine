'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import logger from '../src/lib/logger';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const {
    autoConnect = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
  } = options;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const reconnectCount = useRef(0);

  const connect = useCallback(() => {
    try {
      const newSocket = io(url, {
        auth: {
          token: localStorage.getItem('auth_token') || '',
        },
        reconnectionAttempts,
        reconnectionDelay,
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        setError(null);
        reconnectCount.current = 0;
        console.log('WebSocket connected');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
      });

      newSocket.on('connect_error', (err) => {
        setError(err);
        console.error('WebSocket connection error:', err);
      });

      setSocket(newSocket);
    } catch (err) {
      setError(err as Error);
    }
  }, [url, reconnectionAttempts, reconnectionDelay]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  const emit = useCallback(
    (event: string, data?: any) => {
      if (socket && isConnected) {
        socket.emit(event, data);
      }
    },
    [socket, isConnected]
  );

  const subscribe = useCallback(
    (event: string, handler: (data: any) => void) => {
      if (socket) {
        socket.on(event, handler);
        return () => {
          socket.off(event, handler);
        };
      }
    },
    [socket]
  );

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    socket,
    isConnected,
    error,
    connect,
    disconnect,
    emit,
    subscribe,
  };
}
