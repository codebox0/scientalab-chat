import { Injectable } from '@nestjs/common';
import { ConversationEntity, MessageEntity } from '../../../domain/entities';
import { ChatRepositoryPort } from '../../../domain/ports';
import { SessionIdVO } from '../../../domain/value-objects';

/**
 * In memory chat repository adapter
 * @description This adapter is used to store the conversations and messages in memory.
 */
@Injectable()
export class InMemoryChatRepositoryAdapter implements ChatRepositoryPort {
  /**
   * Conversations map
   * @description This map is used to store the conversations
   */
  private conversations = new Map<string, ConversationEntity>();

  /**
   * Messages map
   * @description This map is used to store the messages
   */
  private messages = new Map<string, MessageEntity[]>();

  /**
   * Save a conversation
   * @param conversation - The conversation to save
   * @returns The saved conversation
   */
  async saveConversation(
    conversation: ConversationEntity,
  ): Promise<ConversationEntity> {
    console.log(`💾 Sauvegarde conversation: ${conversation.id.toString()}`);
    this.conversations.set(conversation.id.toString(), conversation);
    console.log(
      `✅ Conversation sauvegardée. Total: ${this.conversations.size}`,
    );
    return conversation;
  }

  /**
   * Find a conversation by ID
   * @param id - The ID of the conversation
   * @returns The conversation if found, null otherwise
   */
  async findConversationById(
    id: SessionIdVO,
  ): Promise<ConversationEntity | null> {
    const found = this.conversations.get(id.toString()) || null;
    console.log(
      `🔍 Recherche conversation: ${id.toString()} - ${found ? 'TROUVÉE' : 'NON TROUVÉE'}`,
    );
    console.log(
      `📊 Conversations disponibles: ${Array.from(this.conversations.keys()).join(', ')}`,
    );

    if (found) {
      // Load messages for this conversation
      const messages = await this.findMessagesByConversationId(id);
      console.log(`📊 Messages chargés pour conversation: ${messages.length}`);

      // Create a new conversation with loaded messages
      const conversationWithMessages =
        ConversationEntity.createWithIdAndMessages(
          found.id,
          found.userId,
          found.title,
          found.context,
          messages,
        );

      return conversationWithMessages;
    }

    return null;
  }

  /**
   * Find conversations by user ID
   * @param userId - The ID of the user
   * @returns The conversations of the user
   */
  async findConversationsByUserId(
    userId: string,
  ): Promise<ConversationEntity[]> {
    return Array.from(this.conversations.values()).filter(
      (conversation) => conversation.userId === userId,
    );
  }

  /**
   * Save a message
   * @param message - The message to save
   * @returns The saved message
   */
  async saveMessage(message: MessageEntity): Promise<MessageEntity> {
    const sessionId = message.sessionId.toString();
    const existingMessages = this.messages.get(sessionId) || [];
    existingMessages.push(message);
    this.messages.set(sessionId, existingMessages);
    console.log(
      `💾 Sauvegarde message: ${message.id} pour session ${sessionId}`,
    );
    console.log(
      `📊 Total messages pour session ${sessionId}: ${existingMessages.length}`,
    );
    console.log(`📊 Contenu message: ${message.content.substring(0, 50)}...`);
    return message;
  }

  /**
   * Find messages by conversation ID
   * @param conversationId - The ID of the conversation
   * @param limit - The limit of messages to return
   * @returns The messages of the conversation
   */
  async findMessagesByConversationId(
    conversationId: SessionIdVO,
    limit?: number,
  ): Promise<MessageEntity[]> {
    const messages = this.messages.get(conversationId.toString()) || [];
    console.log(
      `📊 Messages trouvés pour ${conversationId.toString()}: ${messages.length}`,
    );
    console.log(
      `📊 Toutes les sessions avec messages: ${Array.from(this.messages.keys()).join(', ')}`,
    );
    return limit ? messages.slice(-limit) : messages;
  }

  /**
   * Delete a conversation
   * @param id - The ID of the conversation
   */
  async deleteConversation(id: SessionIdVO): Promise<void> {
    this.conversations.delete(id.toString());
    this.messages.delete(id.toString());
  }

  /**
   * Update a conversation
   * @param conversation - The conversation to update
   * @returns The updated conversation
   */
  async updateConversation(
    conversation: ConversationEntity,
  ): Promise<ConversationEntity> {
    this.conversations.set(conversation.id.toString(), conversation);
    return conversation;
  }

  async searchMessagesInConversation(
    conversationId: SessionIdVO,
    query: string,
    limit: number = 50,
  ): Promise<MessageEntity[]> {
    const messages = this.messages.get(conversationId.toString()) || [];
    const searchQuery = query.toLowerCase().trim();

    if (!searchQuery) {
      return messages.slice(-limit);
    }

    const matchingMessages = messages.filter((message) => {
      const content = message.content.toLowerCase();
      const role = message.role.toString().toLowerCase();

      // Recherche dans le contenu et le rôle
      return content.includes(searchQuery) || role.includes(searchQuery);
    });

    console.log(
      `🔍 Recherche dans session ${conversationId.toString()}: "${query}" -> ${matchingMessages.length} résultats`,
    );

    return matchingMessages.slice(-limit);
  }

  async searchConversationsByUser(
    userId: string,
    query: string,
    limit: number = 20,
  ): Promise<ConversationEntity[]> {
    const userConversations = Array.from(this.conversations.values()).filter(
      (conversation) => conversation.userId === userId,
    );

    const searchQuery = query.toLowerCase().trim();

    if (!searchQuery) {
      return userConversations.slice(-limit);
    }

    const matchingConversations = userConversations.filter((conversation) => {
      const title = conversation.title.toLowerCase();
      const userIdMatch = conversation.userId.toLowerCase();

      // Recherche dans le titre et l'ID utilisateur
      return title.includes(searchQuery) || userIdMatch.includes(searchQuery);
    });

    console.log(
      `🔍 Recherche conversations utilisateur ${userId}: "${query}" -> ${matchingConversations.length} résultats`,
    );

    return matchingConversations.slice(-limit);
  }
}
