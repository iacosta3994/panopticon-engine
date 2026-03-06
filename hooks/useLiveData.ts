'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from './useWebSocket';

interface UseLiveDataOptions<T> {
  room: string;
  event: string;
  initialData?: T[];
  maxItems?: number;
}

export function useLiveData<T>({
  room,
  event,
  initialData = [],
  maxItems = 100,
}: UseLiveDataOptions<T>) {
  const { socket, isConnected, subscribe } = useWebSocket(
    process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3002'
  );
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Subscribe to room
    socket.emit('subscribe', room);

    // Listen for new data
    const unsubscribe = subscribe?.(event, (newItem: T) => {
      setData((prev) => {
        const updated = [newItem, ...prev];
        return updated.slice(0, maxItems);
      });
    });

    // Request initial data
    socket.emit(`request:${room}`);
    socket.once(`${room}:initial`, (initialItems: T[]) => {
      setData(initialItems.slice(0, maxItems));
      setLoading(false);
    });

    return () => {
      socket.emit('unsubscribe', room);
      unsubscribe?.();
    };
  }, [socket, isConnected, room, event, maxItems, subscribe]);

  return { data, loading, isConnected };
}
