import { Inject, Injectable } from '@nestjs/common';
import type { ChatRepositoryPort } from '../../../domain/ports';
import { SessionIdVO } from '../../../domain/value-objects';
import { CHAT_REPOSITORY_PORT_TOKEN } from '../../constants/tokens';

/**
 * Validate session command
 * @description This interface is used to represent the command for the validate session use case.
 */
export interface ValidateSessionCommand {
  readonly sessionId: string;
}

/**
 * Validate session result
 * @description This interface is used to represent the result of the validate session use case.
 */
export interface ValidateSessionResult {
  readonly isValid: boolean;
  readonly sessionId: string;
  readonly conversation?: {
    readonly id: string;
    readonly userId: string;
    readonly title: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
  };
}

/**
 * Validate session use case
 * @description This class is used to represent the validate session use case.
 */
@Injectable()
export class ValidateSessionUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY_PORT_TOKEN)
    private readonly chatRepositoryPort: ChatRepositoryPort,
  ) {}

  async execute(
    command: ValidateSessionCommand,
  ): Promise<ValidateSessionResult> {
    // 1. Validate and create value objects
    const sessionId = SessionIdVO.fromString(command.sessionId);

    // 2. Check if session exists
    const conversation =
      await this.chatRepositoryPort.findConversationById(sessionId);

    if (!conversation) {
      console.log(`❌ Session ${command.sessionId} non trouvée - invalide`);
      return {
        isValid: false,
        sessionId: command.sessionId,
      };
    }

    console.log(`✅ Session ${command.sessionId} trouvée - valide`);

    return {
      isValid: true,
      sessionId: command.sessionId,
      conversation: {
        id: conversation.id.toString(),
        userId: conversation.userId,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    };
  }
}
