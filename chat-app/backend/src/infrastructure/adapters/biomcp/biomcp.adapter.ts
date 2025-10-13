import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter } from 'events';
import { EventSource } from 'eventsource';
import { QueryEntity } from '../../../domain/entities';
import { BioMCPPort, BioMCPResponse } from '../../../domain/ports';

interface PendingRequest {
  resolve: (value: BioMCPResponse) => void;
  reject: (reason?: any) => void;
  timeout: NodeJS.Timeout;
}

/**
 * BioMCP adapter
 * @description This adapter is used to connect to the BioMCP server and send requests.
 */
@Injectable()
export class BioMCPAdapter implements BioMCPPort {
  private readonly logger = new Logger(BioMCPAdapter.name);
  private eventSource: EventSource | null = null;
  private sessionId: string | null = null;
  private endpointUrl: string | null = null;
  private isConnectedFlag = false;
  private sseEmitter = new EventEmitter();
  private reconnectionAttempts = 0;
  private maxReconnectionAttempts = 10;
  private baseReconnectDelay = 1000; // 1s initial
  private pendingRequests = new Map<string, PendingRequest>();
  private requestIdCounter = 0;

  private readonly ssePath: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    // Validate environment variables
    const biomcpUrl = this.configService.get<string>('BIOMCP_URL');
    if (!biomcpUrl) {
      throw new Error('BIOMCP_URL environment variable is required');
    }

    this.baseUrl = biomcpUrl;
    this.ssePath = this.configService.get<string>('BIO_MCP_SSE_PATH') || '/sse';

    this.sseEmitter.on('sse-message', this.handleSSEMessage.bind(this));
    this.sseEmitter.on('session-ready', this.handleSessionReady.bind(this));
    this.connect().catch((error) =>
      this.logger.error('Initial BioMCP connection failed:', error),
    );
  }

  /**
   * Connect to the BioMCP server
   * @returns The connection result
   */
  private async connect(): Promise<void> {
    if (this.eventSource) {
      this.logger.warn('Connexion SSE déjà active');
      return;
    }

    const sseUrl = `${this.baseUrl}${this.ssePath}`;
    this.logger.log(`Connexion SSE: ${sseUrl}`);

    this.eventSource = new EventSource(sseUrl);

    this.eventSource.onopen = () => {
      this.isConnectedFlag = true;
      this.reconnectionAttempts = 0; // Reset on successful connection
      this.logger.log('✅ SSE établie');
    };

    this.eventSource.onerror = (error: Event) => {
      this.logger.error(`❌ SSE Error:`, error);
      this.isConnectedFlag = false;
      this.handleReconnection();
    };

    this.eventSource.onmessage = (event: MessageEvent) => {
      this.handleMessage(event.data);
    };

    this.eventSource.addEventListener('endpoint', (event: MessageEvent) => {
      this.handleMessage(event.data);
    });
  }

  /**
   * Disconnect from the BioMCP server
   * @returns The disconnection result
   */
  private async disconnect(): Promise<void> {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnectedFlag = false;
      this.sessionId = null;
      this.endpointUrl = null;
      this.logger.log('Connexion SSE fermée');
    }
  }

  /**
   * Reconnect to the BioMCP server
   * @returns The reconnection result
   */
  private async reconnect(): Promise<void> {
    if (this.reconnectionAttempts >= this.maxReconnectionAttempts) {
      this.logger.error(
        `🛑 Max reconnexion SSE atteint (${this.maxReconnectionAttempts}). Abandon.`,
      );
      return;
    }

    const delay =
      this.baseReconnectDelay * Math.pow(2, this.reconnectionAttempts);
    this.reconnectionAttempts++;
    this.logger.warn(
      `Reconnexion SSE... (tentative ${this.reconnectionAttempts}/${this.maxReconnectionAttempts}, délai: ${delay}ms)`,
    );

    await this.disconnect();
    await new Promise((resolve) => setTimeout(resolve, delay));
    await this.connect();
  }

  /**
   * Handle a message from the BioMCP server
   * @param data - The message data
   */
  private handleMessage(data: string): void {
    this.logger.log(`📨 SSE Message catch`);

    if (data && (data.startsWith('/message') || data.includes('session_id='))) {
      this.endpointUrl = data;
      let match = data.match(/sessionId=([a-f0-9-]+)/);
      if (!match) {
        match = data.match(/session_id=([a-f0-9]+)/);
      }
      if (match && match[1]) {
        this.sessionId = match[1];
        this.logger.log(
          `✅ Session: ${this.sessionId}, Endpoint: ${this.endpointUrl}`,
        );
        this.sseEmitter.emit('session-ready', {
          sessionId: this.sessionId,
          endpointUrl: this.endpointUrl,
        });
      }
      return;
    }

    try {
      let jsonData;
      if (data.startsWith('data: ')) {
        jsonData = JSON.parse(data.substring(6));
      } else if (data.startsWith('{')) {
        jsonData = JSON.parse(data);
      } else if (data.startsWith(': ping')) {
        return;
      } else {
        this.logger.log(
          `📨 SSE data non-JSON/non-ping: ${data.substring(0, 100)}`,
        );
        return;
      }

      this.logger.log(
        `📨 SSE JSON reçu: ${JSON.stringify(jsonData).substring(0, 200)}`,
      );

      if (jsonData && jsonData.id !== undefined) {
        this.logger.log(
          `📦 Réponse outil: ${jsonData.id} (type: ${typeof jsonData.id})`,
        );

        if (jsonData.result) {
          this.sseEmitter.emit('sse-message', {
            requestId: jsonData.id,
            data: jsonData.result,
          });
        } else if (jsonData.error) {
          this.logger.warn(
            `⚠️ SSE erreur pour ID ${jsonData.id}: ${jsonData.error.message}`,
          );
          this.sseEmitter.emit('sse-message', {
            requestId: jsonData.id,
            error: jsonData.error,
          });
        }
      }
    } catch (error: any) {
      this.logger.debug(`Non-JSON ignoré: ${data}`);
    }
  }

  /**
   * Get the reconnect delay
   * @returns The reconnect delay
   */
  private getReconnectDelay(): number {
    return this.baseReconnectDelay * Math.pow(2, this.reconnectionAttempts);
  }

  /**
   * Handle a reconnection to the BioMCP server
   */
  private handleReconnection(): void {
    setTimeout(() => {
      this.reconnect().catch((error) => {
        this.logger.error('Erreur reconnexion:', error);
      });
    }, this.getReconnectDelay());
  }

  /**
   * Handle an SSE message from the BioMCP server
   * @param msg - The message data
   */
  private handleSSEMessage(msg: {
    requestId: string | number;
    data: any;
    error?: any;
  }): void {
    const requestIdStr = String(msg.requestId);
    const pending = this.pendingRequests.get(requestIdStr);
    if (!pending) {
      this.logger.warn(`⚠️ Aucune requête en attente pour ID: ${requestIdStr}`);
      return;
    }

    clearTimeout(pending.timeout);

    if (msg.error) {
      this.logger.error(
        `❌ Erreur SSE pour ${requestIdStr}: ${msg.error.message}`,
      );
      pending.resolve({
        success: false,
        error: msg.error.message || 'Unknown error',
        data: msg.error,
        sessionId: this.sessionId || undefined,
        requestId: requestIdStr,
      });
    } else {
      this.logger.log(
        `📦 Réponse SSE reçue pour ${requestIdStr}: ${JSON.stringify(msg.data).substring(0, 100)}...`,
      );
      pending.resolve({
        success: true,
        data: msg.data,
        sessionId: this.sessionId || undefined,
        requestId: requestIdStr,
      });
    }

    this.pendingRequests.delete(requestIdStr);
  }

  /**
   * Initialize the BioMCP server
   * @returns The initialization result
   */
  private async initializeMCP(): Promise<BioMCPResponse> {
    if (!this.sessionId || !this.endpointUrl) {
      return {
        success: false,
        error: 'Session ID ou Endpoint URL non disponible pour initialisation',
      };
    }

    // ÉTAPE 1: Requête initialize
    const initRequest = {
      jsonrpc: '2.0',
      id: 0,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {
          sampling: {},
          elicitation: {},
          roots: {
            listChanged: true,
          },
        },
        clientInfo: {
          name: 'biomcp-client',
          version: '1.0.0',
        },
      },
    };

    this.logger.log(`🔧 Initialisation MCP: ${JSON.stringify(initRequest)}`);

    try {
      const url = `${this.baseUrl}${this.endpointUrl}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initRequest),
      });

      const responseText = await response.text();
      this.logger.log(
        `🔧 Réponse initialize: ${responseText} (status: ${response.status})`,
      );

      if (!response.ok) {
        return {
          success: false,
          error: `Erreur initialize: ${response.status} - ${responseText}`,
        };
      }

      // ÉTAPE 2: Notification initialized
      const initializedNotification = {
        jsonrpc: '2.0',
        method: 'notifications/initialized',
      };

      this.logger.log(
        `🔧 Notification initialized: ${JSON.stringify(initializedNotification)}`,
      );

      const initializedResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initializedNotification),
      });

      const initializedText = await initializedResponse.text();
      this.logger.log(
        `🔧 Réponse initialized: ${initializedText} (status: ${initializedResponse.status})`,
      );

      if (!initializedResponse.ok) {
        return {
          success: false,
          error: `Erreur initialized: ${initializedResponse.status} - ${initializedText}`,
        };
      }

      this.logger.log('✅ Initialisation MCP terminée avec succès');
      return { success: true };
    } catch (error) {
      this.logger.error(`❌ Erreur lors de l'initialisation MCP:`, error);
      return {
        success: false,
        error: `Erreur initialisation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Handle a session ready event from the BioMCP server
   * @param data - The session data
   */
  private async handleSessionReady(data: {
    sessionId: string;
    endpointUrl: string;
  }): Promise<void> {
    this.logger.log(
      `🔄 Nouvelle session détectée: ${data.sessionId}, initialisation automatique...`,
    );

    try {
      const initResult = await this.initializeMCP();
      if (initResult.success) {
        this.logger.log(
          `✅ Initialisation automatique réussie pour la session ${data.sessionId}`,
        );
      } else {
        this.logger.error(
          `❌ Échec de l'initialisation automatique pour la session ${data.sessionId}: ${initResult.error}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `❌ Erreur lors de l'initialisation automatique:`,
        error,
      );
    }
  }

  /**
   * Send a request to the BioMCP server
   * @param toolName - The tool name
   * @param params - The request parameters
   * @returns The request result
   */
  private async sendMCPRequest(
    toolName: string,
    params: any,
  ): Promise<BioMCPResponse> {
    if (!this.isConnectedFlag || !this.sessionId || !this.endpointUrl) {
      this.logger.warn('⚠️ Session non connectée, tentative de reconnexion...');
      await this.reconnect();
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for session to stabilize

      if (!this.isConnectedFlag || !this.sessionId || !this.endpointUrl) {
        return {
          success: false,
          error: 'Impossible de se reconnecter à BioMCP',
        };
      }
    }

    const initResult = await this.initializeMCP();
    if (!initResult.success) {
      return initResult;
    }

    const requestId = ++this.requestIdCounter;
    const payload: any = {
      jsonrpc: '2.0',
      id: requestId,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: params,
      },
    };

    // Special handling for 'think' tool _meta parameter
    if (toolName === 'think' && params._meta) {
      payload.params._meta = params._meta;
      delete payload.params.arguments._meta; // Remove from arguments
    }

    this.logger.log(`📤 POST MCP Payload: ${JSON.stringify(payload)}`);

    const promise = new Promise<BioMCPResponse>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(String(requestId));
        const errorMsg = `Timeout SSE pour ${requestId} - Pas de réponse BioMCP`;
        this.logger.error(`❌ ${errorMsg}`);
        resolve({
          success: false,
          error: errorMsg,
          sessionId: this.sessionId || undefined,
          requestId: String(requestId),
        });
      }, 60000); // 60 secondes pour les réponses BioMCP complexes

      this.pendingRequests.set(String(requestId), { resolve, reject, timeout });
    });

    try {
      const url = `${this.baseUrl}${this.endpointUrl}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      this.logger.log(
        `📨 Réponse MCP raw: ${responseText} (status: ${response.status})`,
      );

      if (!response.ok) {
        const errorMsg = `MCP ${response.status}: ${responseText}`;
        this.logger.error(`❌ ${errorMsg}`);

        if (
          response.status === 401 ||
          response.status === 403 ||
          responseText.includes('session') ||
          responseText.includes('expired')
        ) {
          this.logger.warn(
            '🔄 Session expirée détectée, tentative de reconnexion...',
          );
          await this.reconnect();
          const retryResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (retryResponse.ok) {
            this.logger.log('✅ Retry après reconnexion réussi');
            return await promise;
          }
        }

        const pending = this.pendingRequests.get(String(requestId));
        if (pending) {
          clearTimeout(pending.timeout);
          pending.resolve({
            success: false,
            error: errorMsg,
            sessionId: this.sessionId || undefined,
            requestId: String(requestId),
          });
          this.pendingRequests.delete(String(requestId));
        }
        return { success: false, error: errorMsg };
      }

      if (
        responseText.includes('Accepted') ||
        responseText.startsWith('data: ')
      ) {
        this.logger.log(`✅ MCP accepté ${requestId}. Attente SSE...`);
        return await promise;
      } else {
        try {
          const data = JSON.parse(responseText);
          this.logger.log(`📦 Réponse directe pour ${requestId}:`, data);
          if (
            data &&
            typeof data === 'object' &&
            'error' in data &&
            data.error?.code === -32602
          ) {
            const errorData = data.error;
            const errorMsg = errorData?.message || 'Invalid parameters';
            this.logger.error(
              `❌ Invalid params pour ${requestId}: ${errorMsg} (data: ${JSON.stringify(errorData.data)})`,
            );
            const pending = this.pendingRequests.get(String(requestId));
            if (pending) {
              clearTimeout(pending.timeout);
              this.pendingRequests.delete(String(requestId));
            }
            return {
              success: false,
              error: errorMsg,
              data: errorData,
              sessionId: this.sessionId || undefined,
              requestId: String(requestId),
            };
          }
          const pending = this.pendingRequests.get(String(requestId));
          if (pending) {
            clearTimeout(pending.timeout);
            this.pendingRequests.delete(String(requestId));
          }
          return {
            success: true,
            data,
            sessionId: this.sessionId || undefined,
            requestId: String(requestId),
          };
        } catch (parseErr) {
          this.logger.error(
            `❌ Parse erreur: ${parseErr instanceof Error ? parseErr.message : 'Unknown error'}. Fallback timeout.`,
          );
          return await promise;
        }
      }
    } catch (error) {
      this.logger.error(`❌ Fetch erreur pour ${requestId}:`, error);
      return await promise;
    }
  }

  /**
   * Search literature for a query
   * @param query - The query
   * @returns The literature search result
   */
  async searchLiterature(query: QueryEntity): Promise<any[]> {
    const thinkParams: any = {
      thought: `Searching literature for: ${query.text.toString()}`,
      thoughtNumber: 1,
      totalThoughts: 1,
      nextThoughtNeeded: true,
      _meta: { progressToken: 1 },
    };
    await this.sendMCPRequest('think', thinkParams);

    const searchParams = {
      query: query.parameters.query,
      call_benefit: `Searching biomedical literature for: ${query.text.toString()}`,
      domain: 'article',
      genes: query.parameters.genes,
      diseases: query.parameters.diseases,
      variants: query.parameters.variants,
      keywords: query.parameters.keywords,
      conditions: [],
      interventions: [],
      page: 1,
      page_size: query.parameters.page_size,
      max_results_per_domain: 15,
      explain_query: true,
      get_schema: false,
      _meta: { progressToken: 0 },
    };
    const response = await this.sendMCPRequest('search', searchParams);
    return response.success && response.data ? response.data.content : [];
  }

  /**
   * Search clinical trials for a query
   * @param query - The query
   * @returns The clinical trials search result
   */
  async searchClinicalTrials(query: QueryEntity): Promise<any[]> {
    const thinkParams: any = {
      thought: `Searching clinical trials for: ${query.text.toString()}`,
      thoughtNumber: 1,
      totalThoughts: 1,
      nextThoughtNeeded: true,
      _meta: { progressToken: 1 },
    };
    await this.sendMCPRequest('think', thinkParams);

    const searchParams = {
      query: query.parameters.query,
      call_benefit: `Searching clinical trials for: ${query.text.toString()}`,
      domain: 'trial',
      genes: query.parameters.genes,
      diseases: query.parameters.diseases,
      variants: query.parameters.variants,
      keywords: query.parameters.keywords,
      conditions: [],
      interventions: [],
      page: 1,
      page_size: query.parameters.page_size,
      max_results_per_domain: 15,
      explain_query: true,
      get_schema: false,
      _meta: { progressToken: 0 },
    };
    const response = await this.sendMCPRequest('search', searchParams);
    return response.success && response.data ? response.data.content : [];
  }

  /**
   * Get genetic variant information for a query
   * @param query - The query
   * @returns The genetic variant information search result
   */
  async getGeneticVariantInfo(query: QueryEntity): Promise<any[]> {
    const thinkParams: any = {
      thought: `Searching genetic variants for: ${query.text.toString()}`,
      thoughtNumber: 1,
      totalThoughts: 1,
      nextThoughtNeeded: true,
      _meta: { progressToken: 1 },
    };
    await this.sendMCPRequest('think', thinkParams);

    const searchParams = {
      query: query.parameters.query,
      call_benefit: `Searching genetic variant info for: ${query.text.toString()}`,
      domain: 'variant',
      genes: query.parameters.genes,
      diseases: query.parameters.diseases,
      variants: query.parameters.variants,
      keywords: query.parameters.keywords,
      conditions: [],
      interventions: [],
      page: 1,
      page_size: query.parameters.page_size,
      max_results_per_domain: 15,
      explain_query: true,
      get_schema: false,
      _meta: { progressToken: 0 },
    };
    const response = await this.sendMCPRequest('search', searchParams);
    return response.success && response.data ? response.data.content : [];
  }

  /**
   * Search drug interactions for a query
   * @param query - The query
   * @returns The drug interactions search result
   */
  async searchDrugInteractions(query: QueryEntity): Promise<any[]> {
    const thinkParams: any = {
      thought: `Searching drug interactions for: ${query.text.toString()}`,
      thoughtNumber: 1,
      totalThoughts: 1,
      nextThoughtNeeded: true,
      _meta: { progressToken: 1 },
    };
    await this.sendMCPRequest('think', thinkParams);

    const searchParams = {
      query: query.parameters.query,
      call_benefit: `Searching drug interactions for: ${query.text.toString()}`,
      domain: 'article', // Drug interactions are often found in literature
      genes: query.parameters.genes,
      diseases: query.parameters.diseases,
      variants: query.parameters.variants,
      keywords: query.parameters.keywords,
      conditions: [],
      interventions: [],
      page: 1,
      page_size: query.parameters.page_size,
      max_results_per_domain: 15,
      explain_query: true,
      get_schema: false,
      _meta: { progressToken: 0 },
    };
    const response = await this.sendMCPRequest('search', searchParams);
    return response.success && response.data ? response.data.content : [];
  }

  /**
   * Send a request to BioMCP
   * @param toolName - The tool name
   * @param params - The request parameters
   * @returns The response from BioMCP
   */
  async sendRequest(toolName: string, params: any): Promise<BioMCPResponse> {
    return await this.sendMCPRequest(toolName, params);
  }
}
