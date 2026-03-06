import { Server as SocketIOServer, Socket } from 'socket.io';
import logger from '../lib/logger';

export class RoomManager {
  private rooms: Map<string, Set<string>> = new Map();
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.initializeRooms();
  }

  /**
   * Initialize default rooms
   */
  private initializeRooms(): void {
    const defaultRooms = ['anomalies', 'patterns', 'alerts', 'metrics', 'insights'];
    
    for (const room of defaultRooms) {
      this.rooms.set(room, new Set());
    }

    logger.info('Default rooms initialized', { rooms: defaultRooms });
  }

  /**
   * Join a room
   */
  joinRoom(socket: Socket, room: string): void {
    socket.join(room);

    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }

    this.rooms.get(room)!.add(socket.id);

    logger.debug('Client joined room', {
      socketId: socket.id,
      room,
      members: this.rooms.get(room)!.size,
    });

    socket.emit('room:joined', { room });
  }

  /**
   * Leave a room
   */
  leaveRoom(socket: Socket, room: string): void {
    socket.leave(room);

    if (this.rooms.has(room)) {
      this.rooms.get(room)!.delete(socket.id);
    }

    logger.debug('Client left room', {
      socketId: socket.id,
      room,
    });

    socket.emit('room:left', { room });
  }

  /**
   * Broadcast to room
   */
  broadcastToRoom(room: string, event: string, data: any): void {
    this.io.to(room).emit(event, data);
    
    logger.debug('Broadcasted to room', {
      room,
      event,
      members: this.rooms.get(room)?.size || 0,
    });
  }

  /**
   * Get room members
   */
  getRoomMembers(room: string): string[] {
    return Array.from(this.rooms.get(room) || []);
  }

  /**
   * Get all rooms
   */
  getRooms(): string[] {
    return Array.from(this.rooms.keys());
  }

  /**
   * Get room count
   */
  getRoomCount(room: string): number {
    return this.rooms.get(room)?.size || 0;
  }
}
