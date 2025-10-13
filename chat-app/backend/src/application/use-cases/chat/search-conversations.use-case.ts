import { Inject, Injectable } from '@nestjs/common';
import type { ChatRepositoryPort } from '../../../domain/ports';
import { CHAT_REPOSITORY_PORT_TOKEN } from '../../constants/tokens';
import { SearchConversationsResponseDto } from '../../dto';
import { ConversationMapper } from '../../mappers';

/**
 * Search conversations command
 * @description This interface is used to represent the command for the search conversations use case.
 */
export interface SearchConversationsCommand {
  readonly userId: string;
  readonly query: string;
  readonly limit?: number;
}

/**
 * Search conversations use case
 * @description This class is used to represent the search conversations use case.
 */
@Injectable()
export class SearchConversationsUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY_PORT_TOKEN)
    private readonly chatRepositoryPort: ChatRepositoryPort,
  ) {}

  async execute(
    command: SearchConversationsCommand,
  ): Promise<SearchConversationsResponseDto> {
    // 1. Search conversations by user
    const conversations =
      await this.chatRepositoryPort.searchConversationsByUser(
        command.userId,
        command.query,
        command.limit,
      );

    // 2. Convert to DTOs
    const conversationDtos = conversations.map((conversation) =>
      ConversationMapper.toResponseDto(conversation),
    );

    console.log(
      `🔍 Recherche conversations terminée: ${conversationDtos.length} conversations trouvées pour "${command.query}"`,
    );

    return {
      conversations: conversationDtos,
      totalCount: conversationDtos.length,
      query: command.query,
      userId: command.userId,
    };
  }
}
