import { Inject, Injectable } from '@nestjs/common';
import type { ChatRepositoryPort } from '../../../domain/ports';
import { SessionIdVO } from '../../../domain/value-objects';
import { CHAT_REPOSITORY_PORT_TOKEN } from '../../constants/tokens';

/**
 * Delete session command
 * @description This interface is used to represent the command for the delete session use case.
 */
export interface DeleteSessionCommand {
  readonly sessionId: string;
}

/**
 * Delete session result
 * @description This interface is used to represent the result of the delete session use case.
 */
export interface DeleteSessionResult {
  readonly success: boolean;
  readonly sessionId: string;
}

/**
 * Delete session use case
 * @description This class is used to represent the delete session use case.
 */
@Injectable()
export class DeleteSessionUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY_PORT_TOKEN)
    private readonly chatRepositoryPort: ChatRepositoryPort,
  ) {}

  /**
   * Execute
   * @description This method is used to execute the delete session use case.
   */
  async execute(command: DeleteSessionCommand): Promise<DeleteSessionResult> {
    // 1. Validate and create value objects
    const sessionId = SessionIdVO.fromString(command.sessionId);

    // 2. Check if session exists
    const conversation =
      await this.chatRepositoryPort.findConversationById(sessionId);

    if (!conversation) {
      console.log(`❌ Session ${command.sessionId} non trouvée`);
      return {
        success: false,
        sessionId: command.sessionId,
      };
    }

    // 3. Delete the session
    await this.chatRepositoryPort.deleteConversation(sessionId);

    console.log(`✅ Session ${command.sessionId} supprimée avec succès`);

    return {
      success: true,
      sessionId: command.sessionId,
    };
  }
}
