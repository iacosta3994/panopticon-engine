import { create } from 'zustand';
import { Alert } from '../src/lib/types';

interface AlertState {
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  removeAlert: (id: string) => void;
  
  // Filters
  severityFilter: string[];
  setSeverityFilter: (severities: string[]) => void;
  
  statusFilter: string[];
  setStatusFilter: (statuses: string[]) => void;
  
  // Computed
  getFilteredAlerts: () => Alert[];
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
  updateAlert: (id, updates) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),
  removeAlert: (id) => set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),

  severityFilter: [],
  setSeverityFilter: (severityFilter) => set({ severityFilter }),

  statusFilter: ['open', 'acknowledged'],
  setStatusFilter: (statusFilter) => set({ statusFilter }),

  getFilteredAlerts: () => {
    const { alerts, severityFilter, statusFilter } = get();
    return alerts.filter((alert) => {
      const severityMatch = severityFilter.length === 0 || severityFilter.includes(alert.severity);
      const statusMatch = statusFilter.length === 0 || statusFilter.includes(alert.status);
      return severityMatch && statusMatch;
    });
  },
}));
