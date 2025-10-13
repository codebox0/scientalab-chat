import { MessageEntity } from '../../domain/entities';
import { MessageResponseDto } from '../dto';

/**
 * Message mapper
 * @description This class is used to map the message entity to a response DTO.
 */
export class MessageMapper {
  /**
   * To response DTO
   * @description This method is used to map the message entity to a response DTO.
   */
  static toResponseDto(message: MessageEntity): MessageResponseDto {
    return {
      id: message.id,
      content: message.content,
      role: message.role.toString(),
      timestamp: message.timestamp.toISOString(),
      sessionId: message.sessionId.toString(),
      metadata: message.metadata,
    };
  }

  /**
   * To response DTO array
   * @description This method is used to map the message entity to a response DTO.
   */
  static toResponseDtoArray(messages: MessageEntity[]): MessageResponseDto[] {
    return messages.map((message) => this.toResponseDto(message));
  }

  /**
   * From primitives
   * @description This method is used to map the message entity to a response DTO.
   */
  static fromPrimitives(data: {
    id: string;
    content: string;
    role: string;
    timestamp: Date;
    sessionId: string;
    metadata?: any;
  }): MessageEntity {
    return MessageEntity.fromPrimitives(data);
  }
}
