import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import logger from '../lib/logger';
import { ConnectionManager } from './ConnectionManager';
import { RoomManager } from './RoomManager';
import { EventStreamer } from './EventStreamer';
import { LiveMetrics } from './LiveMetrics';
import jwt from 'jsonwebtoken';
import { config } from '../lib/config';

export class WebSocketServer {
  private io: SocketIOServer;
  private connectionManager: ConnectionManager;
  private roomManager: RoomManager;
  private eventStreamer: EventStreamer;
  private liveMetrics: LiveMetrics;

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
      },
    });

    this.connectionManager = new ConnectionManager(this.io);
    this.roomManager = new RoomManager(this.io);
    this.eventStreamer = new EventStreamer(this.io);
    this.liveMetrics = new LiveMetrics(this.io);

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Setup authentication middleware
   */
  private setupMiddleware(): void {
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, config.jwt.secret) as any;
        socket.data.user = decoded;
        next();
      } catch (error) {
        logger.error('WebSocket authentication failed', { error });
        next(new Error('Invalid token'));
      }
    });
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.info('Client connected', {
        socketId: socket.id,
        user: socket.data.user?.email,
      });

      this.connectionManager.addConnection(socket);

      // Handle room subscriptions
      socket.on('subscribe', (room: string) => {
        this.roomManager.joinRoom(socket, room);
      });

      socket.on('unsubscribe', (room: string) => {
        this.roomManager.leaveRoom(socket, room);
      });

      // Handle client requests
      socket.on('request:metrics', () => {
        this.liveMetrics.sendMetricsToClient(socket);
      });

      socket.on('request:alerts', () => {
        this.eventStreamer.sendAlertsToClient(socket);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info('Client disconnected', { socketId: socket.id });
        this.connectionManager.removeConnection(socket.id);
      });
    });
  }

  /**
   * Broadcast event to all clients
   */
  broadcast(event: string, data: any): void {
    this.io.emit(event, data);
    logger.debug('Event broadcasted', { event, clients: this.io.sockets.sockets.size });
  }

  /**
   * Broadcast to specific room
   */
  broadcastToRoom(room: string, event: string, data: any): void {
    this.io.to(room).emit(event, data);
    logger.debug('Event broadcasted to room', { room, event });
  }

  /**
   * Get connection statistics
   */
  getStats(): Record<string, any> {
    return {
      totalConnections: this.io.sockets.sockets.size,
      rooms: this.roomManager.getRooms(),
      ...this.connectionManager.getStats(),
    };
  }

  /**
   * Start broadcasting metrics
   */
  startMetricsBroadcast(): void {
    this.liveMetrics.startBroadcasting();
  }

  /**
   * Stop broadcasting metrics
   */
  stopMetricsBroadcast(): void {
    this.liveMetrics.stopBroadcasting();
  }
}
