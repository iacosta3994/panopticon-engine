import { Server as SocketIOServer, Socket } from 'socket.io';
import logger from '../lib/logger';

export class ConnectionManager {
  private connections: Map<string, Socket> = new Map();
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  /**
   * Add new connection
   */
  addConnection(socket: Socket): void {
    this.connections.set(socket.id, socket);
    logger.debug('Connection added', {
      socketId: socket.id,
      total: this.connections.size,
    });
  }

  /**
   * Remove connection
   */
  removeConnection(socketId: string): void {
    this.connections.delete(socketId);
    logger.debug('Connection removed', {
      socketId,
      remaining: this.connections.size,
    });
  }

  /**
   * Get connection by ID
   */
  getConnection(socketId: string): Socket | undefined {
    return this.connections.get(socketId);
  }

  /**
   * Get all connections
   */
  getAllConnections(): Socket[] {
    return Array.from(this.connections.values());
  }

  /**
   * Send message to specific client
   */
  sendToClient(socketId: string, event: string, data: any): void {
    const socket = this.connections.get(socketId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  /**
   * Broadcast to all connections
   */
  broadcast(event: string, data: any): void {
    this.io.emit(event, data);
  }

  /**
   * Get connection statistics
   */
  getStats(): Record<string, any> {
    return {
      activeConnections: this.connections.size,
      connectionIds: Array.from(this.connections.keys()),
    };
  }

  /**
   * Check if client is connected
   */
  isConnected(socketId: string): boolean {
    return this.connections.has(socketId);
  }
}
