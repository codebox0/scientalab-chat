import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import type {
  ConversationResponseDto,
  CreateConversationRequestDto,
  GetMessagesRequestDto,
  MessageResponseDto,
  ProcessQueryResponseDto,
  SearchConversationsRequestDto,
  SearchConversationsResponseDto,
  SearchMessagesRequestDto,
  SearchMessagesResponseDto,
  SendMessageRequestDto,
} from '../../../application/dto';
import {
  CreateConversationUseCase,
  DeleteSessionUseCase,
  ExportConversationPDFUseCase,
  GetHistoryUseCase,
  ProcessQueryUseCase,
  SearchConversationsUseCase,
  SearchMessagesUseCase,
  ValidateSessionUseCase,
} from '../../../application/use-cases';

/**
 * Chat controller
 * @description This controller is used to handle the chat API.
 */
@Controller('chat')
export class ChatController {
  constructor(
    private readonly processQueryUseCase: ProcessQueryUseCase,
    private readonly getHistoryUseCase: GetHistoryUseCase,
    private readonly createConversationUseCase: CreateConversationUseCase,
    private readonly deleteSessionUseCase: DeleteSessionUseCase,
    private readonly validateSessionUseCase: ValidateSessionUseCase,
    private readonly searchMessagesUseCase: SearchMessagesUseCase,
    private readonly searchConversationsUseCase: SearchConversationsUseCase,
    private readonly exportConversationPDFUseCase: ExportConversationPDFUseCase,
  ) {}

  /**
   * Create a session
   * @param createSessionDto - The create session request DTO
   * @returns The created session
   */
  @Post('sessions')
  async createSession(
    @Body() createSessionDto: CreateConversationRequestDto,
  ): Promise<ConversationResponseDto> {
    return await this.createConversationUseCase.execute({
      userId: createSessionDto.userId,
      title: createSessionDto.title,
    });
  }

  /**
   * Validate a session
   * @param sessionId - The session ID
   * @returns The validation result
   */
  @Get('sessions/:sessionId/validate')
  async validateSession(
    @Param('sessionId') sessionId: string,
  ): Promise<{ isValid: boolean; sessionId: string; conversation?: any }> {
    console.log(`🔍 Validation de session: ${sessionId}`);

    const result = await this.validateSessionUseCase.execute({ sessionId });

    return {
      isValid: result.isValid,
      sessionId: result.sessionId,
      conversation: result.conversation,
    };
  }

  /**
   * Send a message
   * @param sessionId - The session ID
   * @param sendMessageDto - The send message request DTO
   * @returns The sent message
   */
  @Post('sessions/:sessionId/messages')
  async sendMessage(
    @Param('sessionId') sessionId: string,
    @Body() sendMessageDto: SendMessageRequestDto,
  ): Promise<ProcessQueryResponseDto> {
    console.log(`📨 Message reçu pour session: ${sessionId}`);
    console.log(`📝 Contenu: ${sendMessageDto.content}`);
    console.log(`👤 userId: ${sendMessageDto.userId}`);
    console.log(`📋 title: ${sendMessageDto.title}`);

    return await this.processQueryUseCase.execute({
      sessionId,
      content: sendMessageDto.content,
      userId: sendMessageDto.userId,
      title: sendMessageDto.title,
    });
  }

  /**
   * Get session messages
   * @param sessionId - The session ID
   * @param query - The query
   * @returns The session messages
   */
  @Get('sessions/:sessionId/messages')
  async getSessionMessages(
    @Param('sessionId') sessionId: string,
    @Query() query: GetMessagesRequestDto,
  ): Promise<MessageResponseDto[]> {
    return await this.getHistoryUseCase.execute({
      sessionId,
      limit: query.limit,
    });
  }

  /**
   * Delete a session
   * @param sessionId - The session ID
   * @returns The deletion result
   */
  @Delete('sessions/:sessionId')
  async deleteSession(
    @Param('sessionId') sessionId: string,
  ): Promise<{ success: boolean; sessionId: string }> {
    console.log(`🗑️ Suppression de session: ${sessionId}`);

    const result = await this.deleteSessionUseCase.execute({ sessionId });

    return {
      success: result.success,
      sessionId: result.sessionId,
    };
  }

  /**
   * Search messages in a session
   * @param sessionId - The session ID
   * @param query - The search query
   * @returns The search results
   */
  @Get('sessions/:sessionId/search')
  async searchMessages(
    @Param('sessionId') sessionId: string,
    @Query() query: SearchMessagesRequestDto,
  ): Promise<SearchMessagesResponseDto> {
    console.log(`🔍 Recherche dans session ${sessionId}: "${query.query}"`);
    return await this.searchMessagesUseCase.execute({
      sessionId,
      query: query.query,
      limit: query.limit,
    });
  }

  /**
   * Search conversations by user
   * @param query - The search query
   * @returns The search results
   */
  @Get('conversations/search')
  async searchConversations(
    @Query() query: SearchConversationsRequestDto,
  ): Promise<SearchConversationsResponseDto> {
    console.log(
      `🔍 Recherche conversations utilisateur ${query.userId}: "${query.query}"`,
    );
    return await this.searchConversationsUseCase.execute({
      userId: query.userId,
      query: query.query,
      limit: query.limit,
    });
  }

  /**
   * Export conversation to PDF
   * @param sessionId - The session ID
   * @param includeMetadata - Whether to include BioMCP metadata
   * @param format - PDF format (A4 or Letter)
   * @param res - Express response object
   */
  @Get('sessions/:sessionId/export/pdf')
  async exportConversationPDF(
    @Param('sessionId') sessionId: string,
    @Res() res: Response,
    @Query('includeMetadata') includeMetadata?: string,
    @Query('format') format?: 'A4' | 'Letter',
  ): Promise<void> {
    console.log(`📄 Export PDF session: ${sessionId}`);

    try {
      const result = await this.exportConversationPDFUseCase.execute({
        sessionId,
        includeMetadata: includeMetadata === 'true',
        format: format || 'A4',
      });

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${result.filename}"`,
      );
      res.setHeader('Content-Length', result.size.toString());

      // Send PDF buffer
      res.send(result.buffer);
    } catch (error: any) {
      console.error(`❌ Erreur export PDF:`, error);
      res.status(500).json({
        error: 'Failed to export conversation to PDF',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
