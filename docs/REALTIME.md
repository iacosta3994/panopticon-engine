# Real-Time Features Documentation

## Overview

The Panopticon Engine uses WebSocket technology (Socket.io) to provide real-time updates, live metrics, and instant alerts.

## Architecture

```
Client (Browser)
    ↓ WebSocket Connection
WebSocket Server (Socket.io)
    │
    ├── Connection Manager (client tracking)
    ├── Room Manager (subscription management)
    ├── Event Streamer (event broadcasting)
    └── Live Metrics (metrics broadcasting)
```

## Server Implementation

### WebSocket Server Setup

**File**: `src/realtime/WebSocketServer.ts`

```typescript
import { WebSocketServer } from './src/realtime/WebSocketServer';
import http from 'http';

const httpServer = http.createServer(app);
const wsServer = new WebSocketServer(httpServer);

// Start metrics broadcasting
wsServer.startMetricsBroadcast();

httpServer.listen(3002);
```

### Connection Manager

**Purpose**: Track all connected clients

**Features**:
- Client connection tracking
- Connection statistics
- Individual client messaging
- Broadcast capabilities

**Usage**:
```typescript
const stats = connectionManager.getStats();
// { activeConnections: 15, connectionIds: [...] }
```

### Room Manager

**Purpose**: Manage topic-based subscriptions

**Available Rooms**:
- `anomalies` - Real-time anomaly detections
- `patterns` - Pattern discoveries
- `alerts` - Alert notifications
- `metrics` - System metrics
- `insights` - AI-generated insights

**Usage**:
```typescript
// Client subscribes to room
socket.emit('subscribe', 'anomalies');

// Server broadcasts to room
roomManager.broadcastToRoom('anomalies', 'anomaly:detected', data);
```

### Event Streamer

**Purpose**: Stream events to subscribed clients

**Events**:
- `observation:new` - New observation captured
- `alert:new` - New alert triggered
- `pattern:detected` - Pattern identified
- `anomaly:detected` - Anomaly found
- `insight:new` - New insight generated
- `system:event` - System-level events

**Usage**:
```typescript
eventStreamer.streamAlert(alert);
eventStreamer.streamAnomaly(anomaly);
eventStreamer.streamPattern(pattern);
```

### Live Metrics

**Purpose**: Broadcast system metrics at regular intervals

**Broadcast Interval**: 5 seconds (configurable)

**Metrics Included**:
- Observation count (last hour)
- Observation rate (per minute)
- Active alert count
- Pattern detection count
- Average system health

**Usage**:
```typescript
liveMetrics.startBroadcasting();
// Broadcasts every 5 seconds to 'metrics' room
```

## Client Implementation

### WebSocket Hook

**File**: `hooks/useWebSocket.ts`

```typescript
import { useWebSocket } from '@/hooks/useWebSocket';

const MyComponent = () => {
  const { connected, subscribe, on, emit } = useWebSocket();

  useEffect(() => {
    if (connected) {
      subscribe('alerts');
      
      on('alert:new', (alert) => {
        console.log('New alert:', alert);
      });
    }
  }, [connected]);

  return <div>Connected: {connected ? 'Yes' : 'No'}</div>;
};
```

**Methods**:
- `connect()` - Establish connection
- `disconnect()` - Close connection
- `subscribe(room)` - Join a room
- `unsubscribe(room)` - Leave a room
- `on(event, callback)` - Listen for events
- `off(event)` - Stop listening
- `emit(event, data)` - Send event to server

### Live Data Hook

**File**: `hooks/useLiveData.ts`

```typescript
import { useLiveData } from '@/hooks/useLiveData';

const MyComponent = () => {
  const { data, loading, connected } = useLiveData({
    room: 'anomalies',
    event: 'anomaly:detected',
  });

  if (loading) return <Loading />;

  return (
    <div>
      {data.map(item => <Item key={item.id} data={item} />)}
    </div>
  );
};
```

**Features**:
- Automatic room subscription
- Real-time data updates
- Loading state management
- Connection status tracking
- Automatic cleanup

### Real-Time Alerts Hook

**File**: `hooks/useRealTimeAlerts.ts`

```typescript
import { useRealTimeAlerts } from '@/hooks/useRealTimeAlerts';

const MyDashboard = () => {
  useRealTimeAlerts(); // Automatically shows toast notifications
  
  return <div>{/* Dashboard content */}</div>;
};
```

**Features**:
- Automatic alert subscription
- Toast notification display
- Severity-based styling
- Dismissible notifications

## Event Types

### Server → Client Events

| Event | Room | Data Type | Description |
|-------|------|-----------|-------------|
| `observation:new` | observations | Observation | New observation captured |
| `alert:new` | alerts | Alert | New alert triggered |
| `pattern:detected` | patterns | Pattern | Pattern identified |
| `anomaly:detected` | anomalies | Anomaly | Anomaly detected |
| `insight:new` | insights | Insight | New insight generated |
| `metrics:update` | metrics | Metrics | System metrics update |
| `room:joined` | - | RoomInfo | Joined room confirmation |
| `room:left` | - | RoomInfo | Left room confirmation |

### Client → Server Events

| Event | Data | Description |
|-------|------|-------------|
| `subscribe` | room: string | Join a room |
| `unsubscribe` | room: string | Leave a room |
| `request:metrics` | - | Request current metrics |
| `request:alerts` | - | Request current alerts |

## Authentication

### Token-Based Auth

```typescript
const socket = io('http://localhost:3002', {
  auth: {
    token: 'your-jwt-token',
  },
});
```

**Token Requirements**:
- Valid JWT token
- Not expired
- Proper signature

**Error Handling**:
```typescript
socket.on('connect_error', (error) => {
  if (error.message === 'Authentication required') {
    // Redirect to login
  }
});
```

## Room Management

### Subscribing to Rooms

```typescript
// Subscribe to multiple rooms
socket.emit('subscribe', 'alerts');
socket.emit('subscribe', 'anomalies');
socket.emit('subscribe', 'metrics');
```

### Room Events

```typescript
// Confirmation events
socket.on('room:joined', ({ room }) => {
  console.log(`Joined room: ${room}`);
});

socket.on('room:left', ({ room }) => {
  console.log(`Left room: ${room}`);
});
```

## Performance Considerations

### Connection Pooling

- Reuse single WebSocket connection per client
- Automatic reconnection with exponential backoff
- Connection health monitoring

### Data Throttling

```typescript
// Limit broadcast frequency
const BROADCAST_INTERVAL = 5000; // 5 seconds

setInterval(() => {
  broadcastMetrics();
}, BROADCAST_INTERVAL);
```

### Message Batching

```typescript
// Batch multiple events
const events = [];
events.push(event1, event2, event3);

socket.emit('events:batch', events);
```

### Client-Side Optimization

```typescript
// Limit data retention
const { data } = useLiveData({
  room: 'metrics',
  event: 'metrics:update',
});

// Keep only last 100 items
const recentData = data.slice(0, 100);
```

## Security

### Authentication

- JWT token verification on connection
- Token expiration handling
- Automatic re-authentication

### Authorization

- Room-based access control
- User role validation
- Data filtering by permissions

### Rate Limiting

```typescript
// Limit events per client
const RATE_LIMIT = 100; // per minute
const clientRates = new Map();
```

## Monitoring

### Connection Metrics

```typescript
const stats = wsServer.getStats();
// {
//   totalConnections: 15,
//   rooms: ['alerts', 'metrics', 'anomalies'],
//   activeConnections: 15,
// }
```

### Health Check

```typescript
// Ping-pong for connection health
socket.on('ping', () => {
  socket.emit('pong');
});
```

## Troubleshooting

### Connection Issues

**Problem**: Client can't connect

**Solutions**:
1. Check WebSocket server is running
2. Verify CORS configuration
3. Check firewall rules
4. Validate authentication token

### Missing Updates

**Problem**: Not receiving real-time updates

**Solutions**:
1. Verify room subscription
2. Check event listener setup
3. Review server-side broadcasting
4. Inspect network tab for WebSocket frames

### High Latency

**Problem**: Slow real-time updates

**Solutions**:
1. Reduce broadcast frequency
2. Implement data throttling
3. Use message batching
4. Optimize payload size
5. Check network conditions

## Testing

### Manual Testing

```bash
# Using wscat
npm install -g wscat
wscat -c ws://localhost:3002

# Send subscription
{"type": "subscribe", "room": "alerts"}
```

### Automated Testing

```typescript
import { io } from 'socket.io-client';

describe('WebSocket Server', () => {
  let client;

  beforeEach(() => {
    client = io('http://localhost:3002', {
      auth: { token: 'test-token' },
    });
  });

  afterEach(() => {
    client.disconnect();
  });

  it('should connect successfully', (done) => {
    client.on('connect', () => {
      expect(client.connected).toBe(true);
      done();
    });
  });
});
```
