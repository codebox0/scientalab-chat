/**
 * Search messages request DTO
 * @description This interface is used to represent the request for searching messages in a conversation.
 */
export interface SearchMessagesRequestDto {
  readonly query: string;
  readonly limit?: number;
}

/**
 * Search conversations request DTO
 * @description This interface is used to represent the request for searching conversations by user.
 */
export interface SearchConversationsRequestDto {
  readonly userId: string;
  readonly query: string;
  readonly limit?: number;
}
