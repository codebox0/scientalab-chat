import {
  ConversationResponseDto,
  MessageResponseDto,
} from './chat-response.dto';

/**
 * Search messages response DTO
 * @description This interface is used to represent the response for searching messages.
 */
export interface SearchMessagesResponseDto {
  readonly messages: MessageResponseDto[];
  readonly totalCount: number;
  readonly query: string;
  readonly sessionId: string;
}

/**
 * Search conversations response DTO
 * @description This interface is used to represent the response for searching conversations.
 */
export interface SearchConversationsResponseDto {
  readonly conversations: ConversationResponseDto[];
  readonly totalCount: number;
  readonly query: string;
  readonly userId: string;
}
