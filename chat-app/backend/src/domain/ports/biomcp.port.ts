import { QueryEntity } from '../entities';

/**
 * BioMCP response
 * @description This interface is used to represent the response from BioMCP.
 */
export interface BioMCPResponse {
  readonly success: boolean;
  readonly data?: any;
  readonly error?: string;
  readonly sessionId?: string;
  readonly requestId?: string;
}

/**
 * BioMCP port
 * @description This interface is used to represent the BioMCP port.
 */
export interface BioMCPPort {
  /**
   * Search literature using BioMCP
   * @param query - The query to search literature for
   * @returns The literature
   */
  searchLiterature(query: QueryEntity): Promise<any[]>;

  /**
   * Search clinical trials using BioMCP
   * @param query - The query to search clinical trials for
   * @returns The clinical trials
   */
  searchClinicalTrials(query: QueryEntity): Promise<any[]>;

  /**
   * Get genetic variant information using BioMCP
   * @param query - The query to get genetic variant information for
   * @returns The genetic variant information
   */
  getGeneticVariantInfo(query: QueryEntity): Promise<any[]>;

  /**
   * Search drug interactions using BioMCP
   * @param query - The query to search drug interactions for
   * @returns The drug interactions
   */
  searchDrugInteractions(query: QueryEntity): Promise<any[]>;

  /**
   * Send a generic request to BioMCP
   * @param toolName - The name of the tool to send a request to
   * @param params - The parameters to send a request to
   * @returns The response from BioMCP
   */
  sendRequest(toolName: string, params: any): Promise<BioMCPResponse>;
}
