# Panopticon Engine Dashboard Guide

## Overview

The Panopticon Engine Dashboard provides a comprehensive, real-time interface for monitoring surveillance operations, analyzing patterns, and managing alerts.

## Features

### 📊 Real-Time Visualization
- Live metrics updates every 5 seconds
- WebSocket-powered real-time data streaming
- Interactive charts and graphs
- Anomaly detection visualizations
- Pattern analysis displays

### 🎨 Cyberpunk UI Theme
- Dark-themed interface optimized for long monitoring sessions
- Neon accent colors (cyan, purple, pink)
- Glass morphism effects
- Smooth animations and transitions
- Responsive design for all screen sizes

### 🔔 Alert Management
- Real-time alert notifications
- Priority-based filtering
- One-click acknowledgment
- Alert aggregation and deduplication
- Historical alert tracking

## Dashboard Pages

### 1. Overview Dashboard (`/dashboard`)

**Components**:
- **Quick Stats Cards**: Observations, Alerts, Patterns, Data Sources
- **Metrics Overview**: 24-hour time-series visualization
- **Temporal Analysis**: Trend detection with forecasting
- **Anomaly Visualization**: Statistical outlier detection
- **Alerts Panel**: Active alerts requiring attention
- **Pattern Visualization**: Top detected patterns

**Features**:
- Auto-refresh every 10 seconds
- Interactive charts with hover details
- Color-coded severity indicators
- Trend indicators (up/down/stable)

### 2. Anomalies Page (`/dashboard/anomalies`)

**Components**:
- **Anomaly Distribution Scatter Plot**: Expected vs Actual values
- **Detection Methods Breakdown**: Z-score, IQR, Moving Average
- **Anomaly List Table**: Sortable, filterable list
- **Severity Filtering**: High, Medium, Low

**Features**:
- Real-time anomaly detection
- Multiple detection methods
- Confidence scoring
- Historical tracking

### 3. Patterns Page (`/dashboard/patterns`)

**Components**:
- **Pattern Distribution Chart**: By type (sequential, frequency, correlation)
- **Pattern Cards**: Detailed pattern information
- **Confidence Metrics**: Visual confidence indicators
- **Occurrence Tracking**: Pattern frequency over time

**Features**:
- Pattern type filtering
- Confidence-based sorting
- Signature visualization
- Occurrence statistics

### 4. Alerts Page (`/dashboard/alerts`)

**Components**:
- **Alert Status Tabs**: All, Open, Acknowledged, Resolved
- **Alert Cards**: Detailed alert information
- **Quick Actions**: Acknowledge, Resolve, Dismiss
- **Timeline View**: Alert history

**Features**:
- Status-based filtering
- One-click acknowledgment
- Resolution tracking
- Alert aggregation display

### 5. Temporal Analysis Page (`/dashboard/temporal`)

**Components**:
- **Trend Analysis Charts**: Multiple metrics
- **Forecasting Visualization**: Predictive analytics
- **Change Point Detection**: Significant shifts
- **Seasonality Analysis**: Repeating patterns

**Features**:
- Multiple timeframe selection (1h, 24h, 7d, 30d)
- Confidence intervals
- Linear regression trending
- Interactive zoom and pan

### 6. Settings Page (`/dashboard/settings`)

**Components**:
- **Threshold Configuration**: Adjust monitoring thresholds
- **Data Source Management**: Add/edit/remove sources
- **Notification Settings**: Configure alert channels
- **Integration Management**: Atlas, Notion, Email, Telegram

**Features**:
- Real-time configuration updates
- Test notification buttons
- API key management
- Feature flag toggles

## UI Components

### Navigation Components

#### Sidebar Navigation
```tsx
<Navigation />
```

**Features**:
- Active route highlighting
- Icon-based menu items
- Animated hover states
- System status indicator

#### Top Bar
```tsx
<TopBar />
```

**Features**:
- Global search
- Notification center
- User menu
- Quick actions

#### Status Indicator
```tsx
<StatusIndicator />
```

**Features**:
- Real-time system health
- Live metric counters
- Last update timestamp
- Status color coding

### Data Visualization Components

#### Metrics Overview
```tsx
<MetricsOverview />
```

**Chart Types**:
- Area charts for time-series
- Multiple data series
- Custom gradients
- Interactive tooltips

#### Anomaly Visualization
```tsx
<AnomalyVisualization />
```

**Chart Types**:
- Scatter plots for distribution
- Color-coded severity
- Variable bubble sizes
- Statistical bounds

#### Pattern Visualization
```tsx
<PatternVisualization />
```

**Display Features**:
- Pattern confidence bars
- Occurrence counters
- Type badges
- Expandable details

#### Temporal Analysis
```tsx
<TemporalAnalysis />
```

**Chart Types**:
- Line charts with trend lines
- Forecast projections
- Confidence intervals
- Reference lines

## Real-Time Features

### WebSocket Connection

**Custom Hook**:
```typescript
import { useWebSocket } from '@/hooks/useWebSocket';

const { connected, subscribe, on } = useWebSocket();

// Subscribe to room
subscribe('alerts');

// Listen for events
on('alert:new', (alert) => {
  console.log('New alert:', alert);
});
```

### Live Data Subscription

**Custom Hook**:
```typescript
import { useLiveData } from '@/hooks/useLiveData';

const { data, loading, connected } = useLiveData({
  room: 'anomalies',
  event: 'anomaly:detected',
});
```

### Real-Time Alerts

**Custom Hook**:
```typescript
import { useRealTimeAlerts } from '@/hooks/useRealTimeAlerts';

// Automatically shows toast notifications for new alerts
useRealTimeAlerts();
```

## State Management

### Dashboard Store

```typescript
import { useDashboardStore } from '@/store/dashboardStore';

const {
  stats,
  setStats,
  timeRange,
  setTimeRange,
  refreshInterval,
} = useDashboardStore();
```

**State**:
- System statistics
- Time range selection
- Selected items
- UI preferences
- Refresh intervals

### Alert Store

```typescript
import { useAlertStore } from '@/store/alertStore';

const {
  alerts,
  addAlert,
  updateAlert,
  getFilteredAlerts,
  severityFilter,
} = useAlertStore();
```

**State**:
- Alert collection
- Filters (severity, status)
- Alert CRUD operations
- Computed filtered lists

## Styling Guidelines

### Color Palette

```css
/* Primary Colors */
--cyber-blue: #00f3ff;
--cyber-purple: #9d00ff;
--cyber-pink: #ff00ea;
--cyber-green: #00ff9f;

/* Background */
--slate-950: #020617;
--slate-900: #0f172a;
--slate-800: #1e293b;

/* Accents */
--cyan-400: #22d3ee;
--blue-500: #3b82f6;
--purple-500: #a855f7;
```

### Component Patterns

**Card Container**:
```tsx
<div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
  {/* Content */}
</div>
```

**Stat Card**:
```tsx
<div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 backdrop-blur border border-cyan-500/30 rounded-xl p-6">
  {/* Stats */}
</div>
```

**Glow Effect**:
```tsx
<div className="shadow-cyber hover:shadow-cyber-lg transition-all">
  {/* Glowing content */}
</div>
```

### Animations

**Pulse Effect**:
```tsx
<span className="animate-pulse">Loading...</span>
```

**Scan Effect**:
```tsx
<div className="animate-scan">Scanning...</div>
```

**Fade In**:
```tsx
<div className="animate-fade-in">Content</div>
```

## Responsive Design

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Grid Layouts

```tsx
{/* Responsive grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Cards */}
</div>
```

## Performance Optimization

### Lazy Loading

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Loading />,
});
```

### Memoization

```typescript
import { useMemo } from 'react';

const expensiveCalculation = useMemo(() => {
  return complexCalculation(data);
}, [data]);
```

### Virtual Scrolling

For large lists, implement virtual scrolling to render only visible items.

## Accessibility

### ARIA Labels

```tsx
<button aria-label="Acknowledge alert">
  <FiCheckCircle />
</button>
```

### Keyboard Navigation

- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate buttons
- **Escape**: Close modals
- **Arrow Keys**: Navigate lists

### Screen Reader Support

```tsx
<div role="status" aria-live="polite">
  {alerts.length} active alerts
</div>
```

## Customization

### Theme Customization

Edit `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      cyber: {
        blue: '#your-color',
        // ... other colors
      },
    },
  },
}
```

### Dashboard Layout

Edit `app/dashboard/layout.tsx` to customize:
- Sidebar width
- Top bar height
- Content padding
- Navigation items

## Troubleshooting

### WebSocket Not Connecting

1. Check WebSocket server is running
2. Verify `NEXT_PUBLIC_WS_URL` environment variable
3. Check authentication token
4. Review browser console for errors

### Charts Not Rendering

1. Ensure Recharts is installed
2. Check data format matches chart expectations
3. Verify ResponsiveContainer parent has defined height

### Real-Time Updates Not Working

1. Verify WebSocket connection is established
2. Check room subscriptions are active
3. Ensure event listeners are properly set up
4. Review server-side event emission

## Best Practices

1. **Error Boundaries**: Wrap components in error boundaries
2. **Loading States**: Always show loading indicators
3. **Empty States**: Design informative empty states
4. **Accessibility**: Follow WCAG guidelines
5. **Performance**: Monitor and optimize render performance
6. **Testing**: Write tests for critical components
7. **Documentation**: Document complex components

## Example Component

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useLiveData } from '@/hooks/useLiveData';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const MyDashboardComponent = () => {
  const { data, loading } = useLiveData({
    room: 'metrics',
    event: 'metrics:update',
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">My Component</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke="#00f3ff" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MyDashboardComponent;
```
