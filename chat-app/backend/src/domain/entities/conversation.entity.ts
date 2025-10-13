import { SessionIdVO } from '../value-objects';
import { MessageEntity } from './message.entity';

/**
 * Conversation context
 * @description This interface is used to represent the context of a conversation.
 */
export interface ConversationContext {
  readonly biomedicalFocus?: string[];
  readonly researchInterests?: string[];
  readonly currentQuery?: string;
}

/**
 * Conversation entity
 * @description This class is used to represent a conversation.
 */
export class ConversationEntity {
  private constructor(
    private readonly _id: SessionIdVO,
    private readonly _userId: string,
    private readonly _title: string,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
    private readonly _messages: MessageEntity[],
    private readonly _context: ConversationContext,
  ) {
    this.validate();
  }

  /**
   * Create a conversation
   * @param userId - The ID of the user
   * @param title - The title of the conversation
   * @param context - The context of the conversation
   * @returns The conversation
   */
  static create(
    userId: string,
    title: string,
    context: ConversationContext = {},
  ): ConversationEntity {
    const now = new Date();
    return new ConversationEntity(
      SessionIdVO.create(),
      userId,
      title,
      now,
      now,
      [],
      context,
    );
  }

  /**
   * Create a conversation from primitives
   * @param data - The data to create a conversation from
   * @returns The conversation
   */
  static fromPrimitives(data: {
    id: string;
    userId: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    messages: any[];
    context: ConversationContext;
  }): ConversationEntity {
    return new ConversationEntity(
      SessionIdVO.fromString(data.id),
      data.userId,
      data.title,
      data.createdAt,
      data.updatedAt,
      data.messages.map((msg) => MessageEntity.fromPrimitives(msg)),
      data.context,
    );
  }

  /**
   * Create a conversation with an ID
   * @param id - The ID of the conversation
   * @param userId - The ID of the user
   * @param title - The title of the conversation
   * @param context - The context of the conversation
   * @returns The conversation
   */
  static createWithId(
    id: SessionIdVO,
    userId: string,
    title: string,
    context: ConversationContext = {},
  ): ConversationEntity {
    const now = new Date();
    return new ConversationEntity(id, userId, title, now, now, [], context);
  }

  /**
   * Create a conversation with an ID and messages
   * @param id - The ID of the conversation
   * @param userId - The ID of the user
   * @param title - The title of the conversation
   * @param context - The context of the conversation
   * @param messages - The messages of the conversation
   * @returns The conversation
   */
  static createWithIdAndMessages(
    id: SessionIdVO,
    userId: string,
    title: string,
    context: ConversationContext = {},
    messages: MessageEntity[] = [],
  ): ConversationEntity {
    const now = new Date();
    return new ConversationEntity(
      id,
      userId,
      title,
      now,
      now,
      messages,
      context,
    );
  }

  /**
   * Get the ID of the conversation
   * @returns The ID of the conversation
   */
  get id(): SessionIdVO {
    return this._id;
  }

  /**
   * Get the ID of the user
   * @returns The ID of the user
   */
  get userId(): string {
    return this._userId;
  }

  /**
   * Get the title of the conversation
   * @returns The title of the conversation
   */
  get title(): string {
    return this._title;
  }

  /**
   * Get the created at date of the conversation
   * @returns The created at date of the conversation
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * Get the updated at date of the conversation
   * @returns The updated at date of the conversation
   */
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Get the messages of the conversation
   * @returns The messages of the conversation
   */
  get messages(): readonly MessageEntity[] {
    return this._messages;
  }

  /**
   * Get the context of the conversation
   * @returns The context of the conversation
   */
  get context(): ConversationContext {
    return this._context;
  }

  /**
   * Get the message count of the conversation
   * @returns The message count of the conversation
   */
  get messageCount(): number {
    return this._messages.length;
  }

  /**
   * Get the last messages of the conversation
   * @param count - The number of messages to get
   * @returns The last messages of the conversation
   */
  getLastMessages(count: number = 10): MessageEntity[] {
    return this._messages.slice(-count);
  }

  /**
   * Get the user messages of the conversation
   * @returns The user messages of the conversation
   */
  getUserMessages(): MessageEntity[] {
    return this._messages.filter((msg) => msg.isUserMessage());
  }

  /**
   * Get the assistant messages of the conversation
   * @returns The assistant messages of the conversation
   */
  getAssistantMessages(): MessageEntity[] {
    return this._messages.filter((msg) => msg.isAssistantMessage());
  }

  /**
   * Add a message to the conversation
   * @param message - The message to add
   * @returns The conversation
   */
  addMessage(message: MessageEntity): ConversationEntity {
    if (!message.sessionId.equals(this._id)) {
      throw new Error('Message session ID does not match conversation ID');
    }

    return new ConversationEntity(
      this._id,
      this._userId,
      this._title,
      this._createdAt,
      new Date(), // Update timestamp
      [...this._messages, message],
      this._context,
    );
  }

  /**
   * Update the context of the conversation
   * @param newContext - The new context
   * @returns The conversation
   */
  updateContext(newContext: ConversationContext): ConversationEntity {
    return new ConversationEntity(
      this._id,
      this._userId,
      this._title,
      this._createdAt,
      new Date(), // Update timestamp
      this._messages,
      { ...this._context, ...newContext },
    );
  }

  /**
   * Check if the conversation has recent activity
   * @param minutes - The number of minutes
   * @returns True if the conversation has recent activity, false otherwise
   */
  hasRecentActivity(minutes: number = 30): boolean {
    const threshold = new Date(Date.now() - minutes * 60 * 1000);
    return this._updatedAt > threshold;
  }

  /**
   * Check if the conversation is empty
   * @returns True if the conversation is empty, false otherwise
   */
  isEmpty(): boolean {
    return this._messages.length === 0;
  }

  /**
   * Convert the conversation to primitives
   * @returns The primitives of the conversation
   */
  toPrimitives(): {
    id: string;
    userId: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    messages: any[];
    context: ConversationContext;
  } {
    return {
      id: this._id.toString(),
      userId: this._userId,
      title: this._title,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      messages: this._messages.map((msg) => msg.toPrimitives()),
      context: this._context,
    };
  }

  /**
   * Validate the conversation
   */
  private validate(): void {
    if (!this._userId || this._userId.length === 0) {
      throw new Error('User ID cannot be empty');
    }

    if (!this._title || this._title.length === 0) {
      throw new Error('Conversation title cannot be empty');
    }

    if (this._title.length > 200) {
      throw new Error('Conversation title is too long (max 200 characters)');
    }
  }
}
