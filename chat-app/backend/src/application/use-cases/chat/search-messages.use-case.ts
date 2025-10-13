import { Inject, Injectable } from '@nestjs/common';
import type { ChatRepositoryPort } from '../../../domain/ports';
import { SessionIdVO } from '../../../domain/value-objects';
import { CHAT_REPOSITORY_PORT_TOKEN } from '../../constants/tokens';
import { SearchMessagesResponseDto } from '../../dto';
import { MessageMapper } from '../../mappers';

/**
 * Search messages command
 * @description This interface is used to represent the command for the search messages use case.
 */
export interface SearchMessagesCommand {
  readonly sessionId: string;
  readonly query: string;
  readonly limit?: number;
}

/**
 * Search messages use case
 * @description This class is used to represent the search messages use case.
 */
@Injectable()
export class SearchMessagesUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY_PORT_TOKEN)
    private readonly chatRepositoryPort: ChatRepositoryPort,
  ) {}

  async execute(
    command: SearchMessagesCommand,
  ): Promise<SearchMessagesResponseDto> {
    // 1. Validate session ID
    const sessionId = SessionIdVO.fromString(command.sessionId);

    // 2. Search messages in conversation
    const messages = await this.chatRepositoryPort.searchMessagesInConversation(
      sessionId,
      command.query,
      command.limit,
    );

    // 3. Convert to DTOs
    const messageDtos = messages.map((message) =>
      MessageMapper.toResponseDto(message),
    );

    console.log(
      `🔍 Recherche terminée: ${messageDtos.length} messages trouvés pour "${command.query}"`,
    );

    return {
      messages: messageDtos,
      totalCount: messageDtos.length,
      query: command.query,
      sessionId: command.sessionId,
    };
  }
}
