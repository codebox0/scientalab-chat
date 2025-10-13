/**
 * Message role enum
 * @property {string} USER - The user role
 * @property {string} ASSISTANT - The AI assistant role
 * @property {string} SYSTEM - The system role
 */
export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

/**
 * Message interface
 * @property {string} id - The message id
 * @property {string} content - The message content
 * @property {MessageRole} role - The message role (user or AI assistant)
 * @property {string} timestamp - The message timestamp
 * @property {string} sessionId - The session ID
 * @property {object} metadata - Optional metadata
 */
export interface IMessage {
  id: string;
  content: string;
  role: MessageRole;
  timestamp?: string;
  sessionId?: string;
  metadata?: {
    biomedicalData?: Record<string, unknown>[];
    sources?: string[];
    confidence?: number;
    queryAnalysis?: Record<string, unknown>;
  };
}
