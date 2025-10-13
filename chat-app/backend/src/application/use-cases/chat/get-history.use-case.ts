import { Inject, Injectable } from '@nestjs/common';
import type { ChatRepositoryPort } from '../../../domain/ports';
import { SessionIdVO } from '../../../domain/value-objects';
import { CHAT_REPOSITORY_PORT_TOKEN } from '../../constants/tokens';
import { MessageResponseDto } from '../../dto';
import { MessageMapper } from '../../mappers';

/**
 * Get history command
 * @description This interface is used to represent the command for getting history.
 */
export interface GetHistoryCommand {
  readonly sessionId: string;
  readonly limit?: number;
}

/**
 * Get history use case
 * @description This class is used to get history.
 */
@Injectable()
export class GetHistoryUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY_PORT_TOKEN)
    private readonly chatRepositoryPort: ChatRepositoryPort,
  ) {}

  async execute(command: GetHistoryCommand): Promise<MessageResponseDto[]> {
    const sessionId = SessionIdVO.fromString(command.sessionId);

    const messages = await this.chatRepositoryPort.findMessagesByConversationId(
      sessionId,
      command.limit,
    );

    return MessageMapper.toResponseDtoArray(messages);
  }
}
