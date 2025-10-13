/**
 * Conversation response DTO
 * @description This class is used to represent the response for a conversation.
 */
export class ConversationResponseDto {
  readonly id: string;
  readonly userId: string;
  readonly title: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly messageCount: number;
  readonly context: {
    biomedicalFocus?: string[];
    researchInterests?: string[];
    currentQuery?: string;
  };
}

/**
 * Message response DTO
 * @description This class is used to represent the response for a message.
 */
export class MessageResponseDto {
  readonly id: string;
  readonly content: string;
  readonly role: string;
  readonly timestamp: string;
  readonly sessionId: string;
  readonly metadata?: {
    biomedicalData?: any[];
    sources?: string[];
    confidence?: number;
    queryAnalysis?: any;
  };
}

/**
 * Process query response DTO
 * @description This class is used to represent the response for a process query.
 */
export class ProcessQueryResponseDto {
  readonly message: MessageResponseDto;
  readonly queryAnalysis: {
    type: string;
    confidence: number;
    keywords: string[];
    entities: {
      genes: string[];
      diseases: string[];
      variants: string[];
      drugs: string[];
    };
  };
  readonly biomedicalData: any[];
}
