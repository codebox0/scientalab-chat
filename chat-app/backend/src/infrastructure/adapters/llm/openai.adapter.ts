import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  LLMAnalysisResult,
  LLMContext,
  LLMPort,
  LLMResponseResult,
} from '../../../domain/ports';

@Injectable()
export class OpenAIAdapter implements LLMPort {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    this.openai = new OpenAI({
      apiKey,
    });
  }

  /**
   * Analyze a biomedical query to extract structured information
   * @param content - The content to analyze
   * @returns The analysis result
   */
  async analyzeBiomedicalQuery(content: string): Promise<LLMAnalysisResult> {
    const prompt = `Analyze this biomedical query: "${content}"

Determine the best BioMCP search type and extract key parameters:

Available types:
- "article" (PubMed/PubTator3): papers, studies, literature, research
- "trial" (ClinicalTrials.gov): clinical trials, phases, protocols, studies
- "variant" (MyVariant.info): genetic variants, mutations, SNPs, genes

Extract key biomedical entities:
- Genes: BRCA1, TNF-alpha, etc.
- Diseases: cancer, diabetes, IBD, etc.
- Drugs: adalimumab, pembrolizumab, etc.
- Variants: rs113488022, etc.

Return JSON format:
{
  "type": "article|trial|variant",
  "parameters": {
    "query": "optimized search query",
    "genes": ["gene1", "gene2"],
    "diseases": ["disease1"],
    "variants": ["variant1"],
    "keywords": ["keyword1", "keyword2"],
    "page_size": 10,
    "domain": "article|trial|variant"
  },
  "confidence": 0.0-1.0
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a biomedical research assistant. Extract structured data from queries. Respond with valid JSON only.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 2000,
      });

      const output = response.choices[0].message.content || '{}';
      const result = JSON.parse(output);

      return {
        type: result.type || 'article',
        parameters: {
          query: result.parameters?.query || content,
          genes: result.parameters?.genes || [],
          diseases: result.parameters?.diseases || [],
          variants: result.parameters?.variants || [],
          keywords: result.parameters?.keywords || [],
          page_size: result.parameters?.page_size || 10,
          domain: result.parameters?.domain || result.type || 'article',
          ...result.parameters,
        },
        confidence: result.confidence || 0.8,
      };
    } catch (error: any) {
      console.error('OpenAI Error in analyzeBiomedicalQuery:', error.message);

      // Fallback
      return {
        type: 'article',
        parameters: {
          query: content,
          genes: [],
          diseases: [],
          variants: [],
          keywords: [content],
          page_size: 10,
          domain: 'article',
        },
        confidence: 0.5,
      };
    }
  }

  /**
   * Generate a response based on messages and context
   * @param messages - The messages to generate a response for
   * @param context - The context to generate a response for
   * @returns The response result
   */
  async generateResponse(
    messages: any[],
    context: LLMContext,
  ): Promise<LLMResponseResult> {
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const biomedicalData = context.biomedicalData || [];
    const queryAnalysis = context.queryAnalysis || {};

    console.log(`🤖 OpenAI - Génération de réponse pour: "${lastUserMessage}"`);
    console.log(
      `📊 OpenAI - Données BioMCP: ${biomedicalData.length} résultats`,
    );
    console.log(
      `🔍 OpenAI - Type de requête: ${queryAnalysis.type || 'unknown'}`,
    );

    const prompt = `You are a biomedical research assistant. Generate a helpful response based on the user's query and the biomedical data retrieved.

User Query: "${lastUserMessage}"
Search Type: ${queryAnalysis.type || 'unknown'}
Confidence: ${queryAnalysis.confidence || 0}

Biomedical Data Retrieved:
${JSON.stringify(biomedicalData, null, 2)}

Instructions:
1. Provide a clear, structured response
2. Cite specific sources when available
3. Include relevant details (titles, authors, dates, etc.)
4. If no data found, suggest alternative search terms
5. Use professional but accessible language
6. Format results nicely with bullet points or numbered lists

Generate a comprehensive response:`;

    try {
      console.log(`📤 OpenAI - Envoi de la requête...`);
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a biomedical research assistant. Provide clear, accurate, and well-structured responses based on scientific data.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 4000,
      });

      const content =
        response.choices[0].message.content ||
        'I found some biomedical data related to your query.';

      console.log(`✅ OpenAI - Réponse reçue: ${content.substring(0, 200)}...`);
      console.log(`📏 OpenAI - Longueur totale: ${content.length} caractères`);

      return {
        content,
        confidence: 0.9,
      };
    } catch (error: any) {
      console.error('OpenAI Error in generateResponse:', error.message);

      return {
        content: `I searched for "${lastUserMessage}" and found ${biomedicalData.length} results. Here's what I found: ${JSON.stringify(biomedicalData.slice(0, 3))}`,
        confidence: 0.7,
      };
    }
  }

  /**
   * Generate BioMCP payload for a specific domain
   * @param domain - The domain to generate a payload for
   * @param baseParams - The base parameters to generate a payload for
   * @returns The payload
   */
  async generateMCPPayload(domain: string, baseParams: any): Promise<any> {
    // This method is not used in the new architecture
    // The BioMCP adapter handles payload generation directly
    return baseParams;
  }
}
