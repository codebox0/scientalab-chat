import { ConversationEntity } from '../../domain/entities';
import { ConversationResponseDto } from '../dto';

/**
 * Conversation mapper
 * @description This class is used to map the conversation entity to a response DTO.
 */
export class ConversationMapper {
  /**
   * To response DTO
   * @description This method is used to map the conversation entity to a response DTO.
   */
  static toResponseDto(
    conversation: ConversationEntity,
  ): ConversationResponseDto {
    return {
      id: conversation.id.toString(),
      userId: conversation.userId,
      title: conversation.title,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
      messageCount: conversation.messageCount,
      context: conversation.context,
    };
  }

  /**
   * To response DTO array
   * @description This method is used to map the conversation entity to a response DTO.
   */
  static toResponseDtoArray(
    conversations: ConversationEntity[],
  ): ConversationResponseDto[] {
    return conversations.map((conversation) =>
      this.toResponseDto(conversation),
    );
  }

  /**
   * From primitives
   * @description This method is used to map the conversation entity to a response DTO.
   */
  static fromPrimitives(data: {
    id: string;
    userId: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    messages: any[];
    context: any;
  }): ConversationEntity {
    return ConversationEntity.fromPrimitives(data);
  }
}
