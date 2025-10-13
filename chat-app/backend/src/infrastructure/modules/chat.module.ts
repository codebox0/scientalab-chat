import { Module } from '@nestjs/common';
import {
  BIOMCP_PORT_TOKEN,
  BIOMEDICAL_ANALYZER_SERVICE_TOKEN,
  CHAT_REPOSITORY_PORT_TOKEN,
  LLM_PORT_TOKEN,
  PDF_EXPORT_PORT_TOKEN,
} from '../../application/constants/tokens';
import {
  CreateConversationUseCase,
  DeleteSessionUseCase,
  ExportConversationPDFUseCase,
  GetHistoryUseCase,
  ProcessQueryUseCase,
  SearchConversationsUseCase,
  SearchMessagesUseCase,
  ValidateSessionUseCase,
} from '../../application/use-cases';
import { BiomedicalAnalyzerService } from '../../domain/services';
import { BioMCPAdapter } from '../adapters/biomcp/biomcp.adapter';
import { ChatController } from '../adapters/controllers/chat.controller';
import { OpenAIAdapter } from '../adapters/llm/openai.adapter';
import { PuppeteerPDFAdapter } from '../adapters/pdf/puppeteer-pdf.adapter';
import { InMemoryChatRepositoryAdapter } from '../adapters/repositories/in-memory-chat.repository';

@Module({
  controllers: [ChatController],
  providers: [
    // Use Cases
    ProcessQueryUseCase,
    GetHistoryUseCase,
    CreateConversationUseCase,
    DeleteSessionUseCase,
    ValidateSessionUseCase,
    SearchMessagesUseCase,
    SearchConversationsUseCase,
    ExportConversationPDFUseCase,

    // Domain Services
    {
      provide: BIOMEDICAL_ANALYZER_SERVICE_TOKEN,
      useClass: BiomedicalAnalyzerService,
    },

    // Ports (Adapters)
    {
      provide: LLM_PORT_TOKEN,
      useClass: OpenAIAdapter,
    },
    {
      provide: BIOMCP_PORT_TOKEN,
      useClass: BioMCPAdapter,
    },
    {
      provide: CHAT_REPOSITORY_PORT_TOKEN,
      useClass: InMemoryChatRepositoryAdapter,
    },
    {
      provide: PDF_EXPORT_PORT_TOKEN,
      useClass: PuppeteerPDFAdapter,
    },
  ],
  exports: [
    ProcessQueryUseCase,
    GetHistoryUseCase,
    CreateConversationUseCase,
    DeleteSessionUseCase,
    ValidateSessionUseCase,
    SearchMessagesUseCase,
    SearchConversationsUseCase,
    ExportConversationPDFUseCase,
  ],
})
export class ChatModule {}
