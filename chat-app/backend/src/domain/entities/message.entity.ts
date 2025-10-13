import { generateUUID } from '../../shared/utils/uuid.util';
import { MessageRoleVO, SessionIdVO } from '../value-objects';

/**
 * Message metadata
 * @description This interface is used to represent the metadata of a message.
 */
export interface MessageMetadata {
  readonly biomedicalData?: any[];
  readonly sources?: string[];
  readonly confidence?: number;
  readonly queryAnalysis?: any;
}

/**
 * Message entity
 * @description This class is used to represent a message.
 */
export class MessageEntity {
  private constructor(
    private readonly _id: string,
    private readonly _content: string,
    private readonly _role: MessageRoleVO,
    private readonly _timestamp: Date,
    private readonly _sessionId: SessionIdVO,
    private readonly _metadata?: MessageMetadata,
  ) {
    this.validate();
  }

  /**
   * Create a message
   * @param content - The content of the message
   * @param role - The role of the message
   * @param sessionId - The session ID of the message
   * @param metadata - The metadata of the message
   * @returns The message
   */
  static create(
    content: string,
    role: MessageRoleVO,
    sessionId: SessionIdVO,
    metadata?: MessageMetadata,
  ): MessageEntity {
    return new MessageEntity(
      generateUUID(),
      content,
      role,
      new Date(),
      sessionId,
      metadata,
    );
  }

  /**
   * Create a message from primitives
   * @param data - The data to create a message from
   * @returns The message
   */
  static fromPrimitives(data: {
    id: string;
    content: string;
    role: string;
    timestamp: Date;
    sessionId: string;
    metadata?: MessageMetadata;
  }): MessageEntity {
    return new MessageEntity(
      data.id,
      data.content,
      MessageRoleVO.create(data.role),
      data.timestamp,
      SessionIdVO.fromString(data.sessionId),
      data.metadata,
    );
  }

  /**
   * Get the ID of the message
   * @returns The ID of the message
   */
  get id(): string {
    return this._id;
  }

  /**
   * Get the content of the message
   * @returns The content of the message
   */
  get content(): string {
    return this._content;
  }

  /**
   * Get the role of the message
   * @returns The role of the message
   */
  get role(): MessageRoleVO {
    return this._role;
  }

  /**
   * Get the timestamp of the message
   * @returns The timestamp of the message
   */
  get timestamp(): Date {
    return this._timestamp;
  }

  /**
   * Get the session ID of the message
   * @returns The session ID of the message
   */
  get sessionId(): SessionIdVO {
    return this._sessionId;
  }

  /**
   * Get the metadata of the message
   * @returns The metadata of the message
   */
  get metadata(): MessageMetadata | undefined {
    return this._metadata;
  }

  /**
   * Check if the message is a user message
   * @returns True if the message is a user message, false otherwise
   */
  isUserMessage(): boolean {
    return this._role.isUser();
  }

  /**
   * Check if the message is an assistant message
   * @returns True if the message is an assistant message, false otherwise
   */
  isAssistantMessage(): boolean {
    return this._role.isAssistant();
  }

  /**
   * Check if the message is a system message
   * @returns True if the message is a system message, false otherwise
   */
  isSystemMessage(): boolean {
    return this._role.isSystem();
  }

  /**
   * Check if the message has biomedical data
   * @returns True if the message has biomedical data, false otherwise
   */
  hasBiomedicalData(): boolean {
    return !!(
      this._metadata?.biomedicalData && this._metadata.biomedicalData.length > 0
    );
  }

  /**
   * Get the confidence of the message
   * @returns The confidence of the message
   */
  getConfidence(): number {
    return this._metadata?.confidence || 0;
  }

  /**
   * Convert the message to primitives
   * @returns The primitives of the message
   */
  toPrimitives(): {
    id: string;
    content: string;
    role: string;
    timestamp: Date;
    sessionId: string;
    metadata?: MessageMetadata;
  } {
    return {
      id: this._id,
      content: this._content,
      role: this._role.toString(),
      timestamp: this._timestamp,
      sessionId: this._sessionId.toString(),
      metadata: this._metadata,
    };
  }

  /**
   * Validate the message
   */
  private validate(): void {
    if (!this._id || this._id.length === 0) {
      throw new Error('Message ID cannot be empty');
    }

    if (!this._content || this._content.length === 0) {
      throw new Error('Message content cannot be empty');
    }

    if (this._content.length > 10000) {
      throw new Error('Message content is too long (max 10000 characters)');
    }
  }
}
