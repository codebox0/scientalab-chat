import { ConversationEntity, MessageEntity } from '../entities';
import { SessionIdVO } from '../value-objects';

/**
 * Interface for the chat repository port
 * @description This interface is used to represent the chat repository port.
 */
export interface ChatRepositoryPort {
  /**
   * Save a conversation
   * @param conversation - The conversation to save
   * @returns The saved conversation
   */
  saveConversation(
    conversation: ConversationEntity,
  ): Promise<ConversationEntity>;

  /**
   * Find a conversation by ID
   * @param id - The ID of the conversation to find
   * @returns The conversation if found, null otherwise
   */
  findConversationById(id: SessionIdVO): Promise<ConversationEntity | null>;

  /**
   * Find conversations by user ID
   * @param userId - The ID of the user to find conversations for
   * @returns The conversations of the user
   */
  findConversationsByUserId(userId: string): Promise<ConversationEntity[]>;

  /**
   * Save a message
   * @param message - The message to save
   * @returns The saved message
   */
  saveMessage(message: MessageEntity): Promise<MessageEntity>;

  /**
   * Find messages by conversation ID
   * @param conversationId - The ID of the conversation to find messages for
   * @param limit - The limit of messages to return
   * @returns The messages of the conversation
   */
  findMessagesByConversationId(
    conversationId: SessionIdVO,
    limit?: number,
  ): Promise<MessageEntity[]>;

  /**
   * Delete a conversation
   * @param id - The ID of the conversation to delete
   */
  deleteConversation(id: SessionIdVO): Promise<void>;

  /**
   * Update a conversation
   * @param conversation - The conversation to update
   * @returns The updated conversation
   */
  updateConversation(
    conversation: ConversationEntity,
  ): Promise<ConversationEntity>;

  /**
   * Search messages in a conversation
   * @param conversationId - The ID of the conversation to search in
   * @param query - The search query
   * @param limit - The limit of results to return
   * @returns The matching messages
   */
  searchMessagesInConversation(
    conversationId: SessionIdVO,
    query: string,
    limit?: number,
  ): Promise<MessageEntity[]>;

  /**
   * Search conversations by user ID and query
   * @param userId - The ID of the user
   * @param query - The search query
   * @param limit - The limit of results to return
   * @returns The matching conversations
   */
  searchConversationsByUser(
    userId: string,
    query: string,
    limit?: number,
  ): Promise<ConversationEntity[]>;
}
