import { Injectable } from '@nestjs/common';
import { ConversationEntity } from '../../../domain/entities';
import { ConversationResponseDto } from '../../dto';
import { ConversationMapper } from '../../mappers';

/**
 * Create conversation command
 * @description This interface is used to represent the command for creating a conversation.
 */
export interface CreateConversationCommand {
  readonly userId: string;
  readonly title: string;
}

/**
 * Create conversation use case
 * @description This class is used to create a conversation.
 */
@Injectable()
export class CreateConversationUseCase {
  async execute(
    command: CreateConversationCommand,
  ): Promise<ConversationResponseDto> {
    const conversation = ConversationEntity.create(
      command.userId,
      command.title,
      {
        biomedicalFocus: [],
        researchInterests: [],
      },
    );

    return ConversationMapper.toResponseDto(conversation);
  }
}
