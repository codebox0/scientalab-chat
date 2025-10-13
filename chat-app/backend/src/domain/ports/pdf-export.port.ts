import { ConversationEntity } from '../entities';

/**
 * PDF export request interface
 * @description This interface is used to represent the request for PDF export.
 */
export interface PDFExportRequest {
  readonly conversation: ConversationEntity;
  readonly includeMetadata?: boolean;
  readonly format?: 'A4' | 'Letter';
}

/**
 * PDF export result interface
 * @description This interface is used to represent the result of PDF export.
 */
export interface PDFExportResult {
  readonly buffer: Buffer;
  readonly filename: string;
  readonly size: number;
}

/**
 * Interface for the PDF export port
 * @description This interface is used to represent the PDF export port.
 */
export interface PDFExportPort {
  /**
   * Export a conversation to PDF
   * @param request - The PDF export request
   * @returns The PDF export result
   */
  exportConversationToPDF(request: PDFExportRequest): Promise<PDFExportResult>;
}
