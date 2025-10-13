import { Inject, Injectable } from '@nestjs/common';
import type { ChatRepositoryPort, PDFExportPort } from '../../../domain/ports';
import { PDFExportRequest } from '../../../domain/ports/pdf-export.port';
import { SessionIdVO } from '../../../domain/value-objects';
import {
  CHAT_REPOSITORY_PORT_TOKEN,
  PDF_EXPORT_PORT_TOKEN,
} from '../../constants/tokens';

/**
 * Export conversation PDF command
 * @description This interface is used to represent the command for the export conversation PDF use case.
 */
export interface ExportConversationPDFCommand {
  readonly sessionId: string;
  readonly includeMetadata?: boolean;
  readonly format?: 'A4' | 'Letter';
}

/**
 * Export conversation PDF response
 * @description This interface is used to represent the response for the export conversation PDF use case.
 */
export interface ExportConversationPDFResponse {
  readonly buffer: Buffer;
  readonly filename: string;
  readonly size: number;
}

/**
 * Export conversation PDF use case
 * @description This class is used to represent the export conversation PDF use case.
 */
@Injectable()
export class ExportConversationPDFUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY_PORT_TOKEN)
    private readonly chatRepositoryPort: ChatRepositoryPort,
    @Inject(PDF_EXPORT_PORT_TOKEN)
    private readonly pdfExportPort: PDFExportPort,
  ) {}

  async execute(
    command: ExportConversationPDFCommand,
  ): Promise<ExportConversationPDFResponse> {
    // 1. Validate session ID
    const sessionId = SessionIdVO.fromString(command.sessionId);

    // 2. Get conversation
    const conversation =
      await this.chatRepositoryPort.findConversationById(sessionId);

    if (!conversation) {
      throw new Error(`Conversation ${command.sessionId} not found`);
    }

    // 3. Export to PDF
    const exportRequest: PDFExportRequest = {
      conversation,
      includeMetadata: command.includeMetadata ?? true,
      format: command.format ?? 'A4',
    };

    console.log(`📄 Export PDF conversation: ${sessionId.toString()}`);

    const result =
      await this.pdfExportPort.exportConversationToPDF(exportRequest);

    console.log(`✅ PDF exporté: ${result.filename} (${result.size} bytes)`);

    return result;
  }
}
