/**
 * WebSocket port interface
 * @description This interface defines the contract for WebSocket communication.
 */
export interface WebSocketMessage {
  readonly id: string;
  readonly content: string;
  readonly role: 'user' | 'assistant' | 'system';
  readonly timestamp: Date;
  readonly sessionId: string;
  readonly metadata?: any;
}

export interface WebSocketEvent {
  readonly type: 'message' | 'typing' | 'status' | 'error';
  readonly data: any;
  readonly sessionId: string;
  readonly timestamp: Date;
}

/**
 * WebSocket port
 * @description This interface defines the contract for WebSocket communication services.
 */
export interface WebSocketPort {
  /**
   * Connect to a session
   * @param sessionId - The session ID to connect to
   * @returns Promise that resolves when connected
   */
  connect(sessionId: string): Promise<void>;

  /**
   * Disconnect from the current session
   */
  disconnect(): void;

  /**
   * Send a message to the session
   * @param message - The message to send
   */
  sendMessage(message: WebSocketMessage): void;

  /**
   * Send an event to the session
   * @param event - The event to send
   */
  sendEvent(event: WebSocketEvent): void;

  /**
   * Listen for messages
   * @param callback - Callback function to handle incoming messages
   */
  onMessage(callback: (message: WebSocketMessage) => void): void;

  /**
   * Listen for events
   * @param callback - Callback function to handle incoming events
   */
  onEvent(callback: (event: WebSocketEvent) => void): void;

  /**
   * Check if connected
   * @returns True if connected, false otherwise
   */
  isConnected(): boolean;

  /**
   * Get current session ID
   * @returns Current session ID or null if not connected
   */
  getCurrentSessionId(): string | null;
}
