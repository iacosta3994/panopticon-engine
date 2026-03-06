import { create } from 'zustand';

interface DashboardState {
  // Stats
  stats: {
    observations: number;
    activeAlerts: number;
    patterns: number;
    dataSources: number;
  };
  setStats: (stats: DashboardState['stats']) => void;

  // Filters
  timeRange: '1h' | '24h' | '7d' | '30d';
  setTimeRange: (range: DashboardState['timeRange']) => void;

  // Selected items
  selectedAlert: string | null;
  setSelectedAlert: (id: string | null) => void;

  selectedPattern: string | null;
  setSelectedPattern: (id: string | null) => void;

  // UI state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  refreshInterval: number;
  setRefreshInterval: (interval: number) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  // Initial state
  stats: {
    observations: 0,
    activeAlerts: 0,
    patterns: 0,
    dataSources: 0,
  },
  setStats: (stats) => set({ stats }),

  timeRange: '24h',
  setTimeRange: (timeRange) => set({ timeRange }),

  selectedAlert: null,
  setSelectedAlert: (selectedAlert) => set({ selectedAlert }),

  selectedPattern: null,
  setSelectedPattern: (selectedPattern) => set({ selectedPattern }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  refreshInterval: 5000,
  setRefreshInterval: (refreshInterval) => set({ refreshInterval }),
}));
