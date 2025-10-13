import { Inject, Injectable } from '@nestjs/common';
import {
  ConversationEntity,
  MessageEntity,
  QueryEntity,
  QueryType,
} from '../../../domain/entities';
import type {
  BioMCPPort,
  ChatRepositoryPort,
  LLMPort,
} from '../../../domain/ports';
import { BiomedicalAnalyzerService } from '../../../domain/services';
import {
  MessageRoleVO,
  QueryTextVO,
  SessionIdVO,
} from '../../../domain/value-objects';
import {
  BIOMCP_PORT_TOKEN,
  BIOMEDICAL_ANALYZER_SERVICE_TOKEN,
  CHAT_REPOSITORY_PORT_TOKEN,
  LLM_PORT_TOKEN,
} from '../../constants/tokens';
import { ProcessQueryResponseDto } from '../../dto';
import { MessageMapper } from '../../mappers';

/**
 * Process query command
 * @description This interface is used to represent the command for the process query use case.
 */
export interface ProcessQueryCommand {
  readonly sessionId: string;
  readonly content: string;
  readonly userId?: string;
  readonly title?: string;
}

/**
 * Process query use case
 * @description This class is used to represent the process query use case.
 */
@Injectable()
export class ProcessQueryUseCase {
  constructor(
    @Inject(LLM_PORT_TOKEN)
    private readonly llmPort: LLMPort,
    @Inject(BIOMCP_PORT_TOKEN)
    private readonly biomcpPort: BioMCPPort,
    @Inject(CHAT_REPOSITORY_PORT_TOKEN)
    private readonly chatRepositoryPort: ChatRepositoryPort,
    @Inject(BIOMEDICAL_ANALYZER_SERVICE_TOKEN)
    private readonly biomedicalAnalyzerService: BiomedicalAnalyzerService,
  ) {}

  async execute(
    command: ProcessQueryCommand,
  ): Promise<ProcessQueryResponseDto> {
    // 1. Validate and create value objects
    const sessionId = SessionIdVO.fromString(command.sessionId);
    const queryText = QueryTextVO.create(command.content);

    // 2. Get or create conversation
    let conversation =
      await this.chatRepositoryPort.findConversationById(sessionId);

    if (!conversation) {
      console.log(`❌ Conversation ${command.sessionId} non trouvée`);
      console.log(`📝 userId: ${command.userId}, title: ${command.title}`);

      // Create new conversation if not found with default values
      const userId = command.userId || 'anonymous';
      const title =
        command.title || `Conversation ${new Date().toLocaleString()}`;

      console.log(
        `🆕 Création nouvelle conversation avec ID: ${sessionId.toString()}`,
      );
      conversation = ConversationEntity.createWithId(sessionId, userId, title, {
        biomedicalFocus: [],
        researchInterests: [],
      });

      console.log(`💾 Sauvegarde de la nouvelle conversation...`);
      await this.chatRepositoryPort.saveConversation(conversation);
      console.log(`✅ Conversation créée et sauvegardée`);
    }

    // 3. Create user message
    const userMessage = MessageEntity.create(
      command.content,
      MessageRoleVO.user(),
      sessionId,
    );

    // 4. Save user message
    await this.chatRepositoryPort.saveMessage(userMessage);

    // 5. Analyze query using domain service
    const analysisResult =
      this.biomedicalAnalyzerService.analyzeQuery(queryText);

    // 6. Create query entity
    const query = QueryEntity.fromAnalysisResult(command.content, {
      type: analysisResult.type,
      parameters: analysisResult.parameters,
    });

    // 7. Search biomedical data if needed
    let biomedicalData: any[] = [];
    if (this.shouldSearchBiomedicalData(query)) {
      console.log(
        `🔍 Recherche de données biomédicales pour: ${query.text.toString()}`,
      );
      biomedicalData = await this.searchBiomedicalData(query);
      console.log(
        `📊 Données BioMCP reçues: ${biomedicalData.length} résultats`,
      );
      if (biomedicalData.length > 0) {
        console.log(
          `📋 Premier résultat BioMCP:`,
          JSON.stringify(biomedicalData[0], null, 2),
        );
      }
    }

    // 8. Generate response using LLM
    const recentMessages = conversation.getLastMessages(10);
    const allMessages = [...recentMessages, userMessage];

    console.log(
      `🤖 Génération de réponse LLM avec ${biomedicalData.length} données BioMCP`,
    );
    const llmResponse = await this.llmPort.generateResponse(allMessages, {
      biomedicalData,
      queryAnalysis: analysisResult,
      sessionContext: conversation.context,
    });
    console.log(
      `✅ Réponse LLM générée: ${llmResponse.content.substring(0, 200)}...`,
    );
    console.log(
      `📏 Longueur totale réponse LLM: ${llmResponse.content.length} caractères`,
    );

    // 9. Create assistant message
    const assistantMessage = MessageEntity.create(
      llmResponse.content,
      MessageRoleVO.assistant(),
      sessionId,
      {
        biomedicalData,
        sources: biomedicalData.map((d: any) => d.source || 'Unknown'),
        confidence: llmResponse.confidence,
        queryAnalysis: analysisResult,
      },
    );

    // 10. Save assistant message
    await this.chatRepositoryPort.saveMessage(assistantMessage);
    console.log(`💾 Message assistant sauvegardé: ${assistantMessage.id}`);

    // 11. Return response
    const response = {
      message: MessageMapper.toResponseDto(assistantMessage),
      queryAnalysis: {
        type: analysisResult.type,
        confidence: analysisResult.confidence,
        keywords: analysisResult.keywords,
        entities: analysisResult.entities,
      },
      biomedicalData,
    };

    console.log(
      `📤 Réponse envoyée au frontend: ${response.message.content.substring(0, 100)}...`,
    );
    return response;
  }

  /**
   * Search biomedical data
   * @param query - The query to search biomedical data for
   * @returns The biomedical data
   */
  private async searchBiomedicalData(query: QueryEntity): Promise<any[]> {
    try {
      switch (query.type) {
        case QueryType.LITERATURE_SEARCH:
          return await this.biomcpPort.searchLiterature(query);
        case QueryType.CLINICAL_TRIALS:
          return await this.biomcpPort.searchClinicalTrials(query);
        case QueryType.GENETIC_VARIANTS:
          return await this.biomcpPort.getGeneticVariantInfo(query);
        case QueryType.DRUG_INTERACTIONS:
          return await this.biomcpPort.searchDrugInteractions(query);
        default:
          return [];
      }
    } catch (error) {
      console.error(
        `❌ Error searching biomedical data (${query.type}):`,
        error,
      );
      return [];
    }
  }

  /**
   * Check if the query should search biomedical data
   * @param query - The query to check if it should search biomedical data for
   * @returns True if the query should search biomedical data, false otherwise
   */
  private shouldSearchBiomedicalData(query: QueryEntity): boolean {
    return query.type !== QueryType.GENERAL_BIOMEDICAL;
  }
}
