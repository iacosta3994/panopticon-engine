'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from './useWebSocket';

interface UseLiveDataOptions {
  room: string;
  event: string;
  initialData?: any[];
}

export function useLiveData<T = any>({
  room,
  event,
  initialData = [],
}: UseLiveDataOptions) {
  const [data, setData] = useState<T[]>(initialData as T[]);
  const [loading, setLoading] = useState(true);
  const { connected, subscribe, unsubscribe, on, off } = useWebSocket();

  useEffect(() => {
    if (connected) {
      subscribe(room);

      // Listen for new data
      on(event, (newItem: T) => {
        setData(prev => [newItem, ...prev].slice(0, 100)); // Keep last 100 items
      });

      // Listen for initial data
      on(`${event}:initial`, (initialItems: T[]) => {
        setData(initialItems);
        setLoading(false);
      });

      setLoading(false);
    }

    return () => {
      if (connected) {
        off(event);
        off(`${event}:initial`);
        unsubscribe(room);
      }
    };
  }, [connected, room, event]);

  return { data, loading, connected };
}
