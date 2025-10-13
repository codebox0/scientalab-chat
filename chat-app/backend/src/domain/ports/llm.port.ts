/**
 * LLM analysis result
 * @description This interface is used to represent the result of the LLM analysis.
 */
export interface LLMAnalysisResult {
  readonly type: string;
  readonly parameters: any;
  readonly confidence: number;
}

/**
 * LLM response result
 * @description This interface is used to represent the result of the LLM response.
 */
export interface LLMResponseResult {
  readonly content: string;
  readonly confidence: number;
}

/**
 * LLM context
 * @description This interface is used to represent the context of the LLM.
 */
export interface LLMContext {
  readonly biomedicalData?: any[];
  readonly queryAnalysis?: any;
  readonly sessionContext?: any;
}

/**
 * LLM port
 * @description This interface is used to represent the LLM port.
 */
export interface LLMPort {
  /**
   * Analyze a biomedical query to extract structured information
   * @param content - The content to analyze
   * @returns The analysis result
   */
  analyzeBiomedicalQuery(content: string): Promise<LLMAnalysisResult>;

  /**
   * Generate a response based on messages and context
   * @param messages - The messages to generate a response for
   * @param context - The context to generate a response for
   * @returns The response result
   */
  generateResponse(
    messages: any[],
    context: LLMContext,
  ): Promise<LLMResponseResult>;

  /**
   * Generate BioMCP payload for a specific domain
   * @param domain - The domain to generate a payload for
   * @param baseParams - The base parameters to generate a payload for
   * @returns The payload
   */
  generateMCPPayload(domain: string, baseParams: any): Promise<any>;
}
