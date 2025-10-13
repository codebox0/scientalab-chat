/**
 * Create conversation request DTO
 * @description This class is used to represent the request for creating a conversation.
 */
export class CreateConversationRequestDto {
  readonly userId: string;
  readonly title: string;
}

/**
 * Send message request DTO
 * @description This class is used to represent the request for sending a message.
 */
export class SendMessageRequestDto {
  readonly content: string;
  readonly userId?: string;
  readonly title?: string;
}

/**
 * Get messages request DTO
 * @description This class is used to represent the request for getting messages.
 */
export class GetMessagesRequestDto {
  readonly limit?: number;
}
