import { Injectable, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  ProcessQueryCommand,
  ProcessQueryUseCase,
} from '../../../application/use-cases/chat/process-query.use-case';

/**
 * Join session data
 * @description This interface is used to represent the data for joining a session.
 */
interface JoinSessionData {
  sessionId: string;
  userId?: string;
}

/**
 * Send message data
 * @description This interface is used to represent the data for sending a message.
 */
interface SendMessageData {
  sessionId: string;
  content: string;
  userId?: string;
  title?: string;
}

/**
 * Chat gateway
 * @description This class is used to handle the chat gateway.
 */
@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly connectedSessions = new Map<string, Set<string>>();

  constructor(private readonly processQueryUseCase: ProcessQueryUseCase) {}

  /**
   * Handle connection
   * @description This method is used to handle the connection.
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  /**
   * Handle disconnect
   * @description This method is used to handle the disconnect.
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove client from all sessions
    for (const [sessionId, clients] of this.connectedSessions.entries()) {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.connectedSessions.delete(sessionId);
      }
    }
  }

  /**
   * Handle join session
   * @description This method is used to handle the join session.
   */
  @SubscribeMessage('join-session')
  async handleJoinSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinSessionData,
  ) {
    try {
      const { sessionId } = data;

      // Join the room
      await client.join(sessionId);

      // Track connected clients for this session
      if (!this.connectedSessions.has(sessionId)) {
        this.connectedSessions.set(sessionId, new Set());
      }
      this.connectedSessions.get(sessionId)!.add(client.id);

      this.logger.log(`Client ${client.id} joined session ${sessionId}`);

      // Notify client of successful join
      client.emit('session-joined', {
        sessionId,
        message: 'Successfully joined session',
        timestamp: new Date(),
      });

      // Notify other clients in the session
      client.to(sessionId).emit('user-joined', {
        sessionId,
        clientId: client.id,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error joining session: ${error.message}`);
      client.emit('error', {
        message: 'Failed to join session',
        error: error.message,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Handle leave session
   * @description This method is used to handle the leave session.
   */
  @SubscribeMessage('leave-session')
  async handleLeaveSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string },
  ) {
    try {
      const { sessionId } = data;

      // Leave the room
      await client.leave(sessionId);

      // Remove from tracking
      const clients = this.connectedSessions.get(sessionId);
      if (clients) {
        clients.delete(client.id);
        if (clients.size === 0) {
          this.connectedSessions.delete(sessionId);
        }
      }

      this.logger.log(`Client ${client.id} left session ${sessionId}`);

      // Notify other clients in the session
      client.to(sessionId).emit('user-left', {
        sessionId,
        clientId: client.id,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error leaving session: ${error.message}`);
      client.emit('error', {
        message: 'Failed to leave session',
        error: error.message,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Handle send message
   * @description This method is used to handle the send message.
   */
  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageData,
  ) {
    try {
      const { sessionId, content, userId, title } = data;

      this.logger.log(
        `Processing message for session ${sessionId}: ${content.substring(0, 50)}...`,
      );

      // Emit typing indicator
      client.to(sessionId).emit('typing', {
        sessionId,
        isTyping: true,
        timestamp: new Date(),
      });

      // Process the message using the existing use case
      const command: ProcessQueryCommand = {
        sessionId,
        content,
        userId,
        title,
      };

      const response = await this.processQueryUseCase.execute(command);

      // Stop typing indicator
      client.to(sessionId).emit('typing', {
        sessionId,
        isTyping: false,
        timestamp: new Date(),
      });

      // Broadcast the response to all clients in the session
      this.server.to(sessionId).emit('new-message', {
        id: response.message.id,
        content: response.message.content,
        role: 'assistant',
        timestamp: response.message.timestamp,
        sessionId: response.message.sessionId,
        metadata: response.message.metadata,
        queryAnalysis: response.queryAnalysis,
        biomedicalData: response.biomedicalData,
      });

      this.logger.log(
        `Message processed and broadcasted for session ${sessionId}`,
      );
    } catch (error) {
      this.logger.error(`Error processing message: ${error.message}`);

      // Stop typing indicator on error
      client.to(data.sessionId).emit('typing', {
        sessionId: data.sessionId,
        isTyping: false,
        timestamp: new Date(),
      });

      // Send error to client
      client.emit('error', {
        message: 'Failed to process message',
        error: error.message,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Handle typing
   * @description This method is used to handle the typing.
   */
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; isTyping: boolean },
  ) {
    const { sessionId, isTyping } = data;

    // Broadcast typing status to other clients in the session
    client.to(sessionId).emit('typing', {
      sessionId,
      isTyping,
      clientId: client.id,
      timestamp: new Date(),
    });
  }

  /**
   * Get connected clients count for a session
   * @description This method is used to get the connected clients count for a session.
   */
  getConnectedClientsCount(sessionId: string): number {
    return this.connectedSessions.get(sessionId)?.size || 0;
  }

  /**
   * Broadcast to all clients in a session
   * @description This method is used to broadcast to all clients in a session.
   */
  broadcastToSession(sessionId: string, event: string, data: any) {
    this.server.to(sessionId).emit(event, data);
  }
}
