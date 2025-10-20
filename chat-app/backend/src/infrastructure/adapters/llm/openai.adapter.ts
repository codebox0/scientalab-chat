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

    const prompt = `You are a biomedical research assistant for Scienta Lab Chat. Generate a helpful response based on the user's query and the biomedical data retrieved.

User Query: "${lastUserMessage}"
Search Type: ${queryAnalysis.type || 'unknown'}
Confidence: ${queryAnalysis.confidence || 0}

Biomedical Data Retrieved:
${JSON.stringify(biomedicalData, null, 2)}

CRITICAL INSTRUCTIONS:
1. Provide a clear, structured response based ONLY on the data provided above
2. Cite specific sources when available (PMID, NCT numbers, variant IDs)
3. Include relevant details (titles, authors, dates, abstracts, study phases)
4. Format results with bullet points or numbered lists for clarity
5. Use professional but accessible language
6. ❌ NEVER return raw JSON data to the user - ALWAYS parse and present it in a readable format
7. If you receive JSON data with "results" arrays, extract and format each result clearly
8. Transform technical data structures into human-readable summaries

STRICT RULES - WHAT YOU MUST NEVER DO:
❌ NEVER suggest visiting websites TO DO MORE SEARCHES (e.g., "visit ClinicalTrials.gov to search for...", "explore PubMed database to find...")
❌ NEVER recommend using external search tools or databases for NEW queries
❌ NEVER add "Additional Resources" or "Further Exploration" sections that redirect to search platforms
❌ NEVER suggest the user go elsewhere to search or explore
❌ NEVER say things like "For comprehensive search, visit..." or "To find more, check..."

✅ WHAT YOU SHOULD DO:
✅ ALWAYS present all available information directly in your response
✅ You CAN and SHOULD include direct links to EXISTING documents and results:
   • PMIDs (e.g., PMID:12345678 with link to the specific article)
   • DOIs (e.g., doi:10.1234/example with link to the paper)
   • NCT numbers (e.g., NCT12345678 with link to that specific trial)
   • Direct article URLs from the data provided
   • PDF links to specific papers found
   • Variant IDs (e.g., rs113488022) with links to that specific variant page
✅ Format these as clickable references to help users access the FOUND results
✅ If data is limited, suggest refining the search query WITHIN THIS CHAT (e.g., "Try searching here with 'Phase III Alzheimer'")
✅ If no data found, suggest alternative keywords to try HERE in the chat

Remember: You can link to specific found results, but never suggest going elsewhere to do new searches. All new searches happen within Scienta Lab Chat.

Generate a comprehensive response:`;

    try {
      console.log(`📤 OpenAI - Envoi de la requête...`);
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a biomedical research assistant for Scienta Lab Chat. Provide clear, accurate, and well-structured responses based ONLY on the scientific data provided. CRITICAL: Never suggest visiting external websites TO DO NEW SEARCHES. You CAN include direct links to specific found results (PMID links, DOI links, NCT trial pages, variant pages) but NEVER suggest going to search platforms like "visit ClinicalTrials.gov to search" or "explore PubMed database". All NEW searches happen within this chat. Always present findings directly with clickable references to the specific results found.',
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

      // Fallback: Format the data manually instead of returning raw JSON
      let fallbackContent = `J'ai trouvé ${biomedicalData.length} résultat(s) pour votre recherche : "${lastUserMessage}".\n\n`;

      try {
        // Try to parse and format the results
        const results = biomedicalData.slice(0, 10); // Limit to 10 results

        results.forEach((item: any, index: number) => {
          // Handle different data structures
          if (item.type === 'text' && item.text) {
            // Parse nested JSON if present
            try {
              const parsed = JSON.parse(item.text);
              if (parsed.results && Array.isArray(parsed.results)) {
                parsed.results
                  .filter((r: any) => r.id !== 'thinking-reminder')
                  .slice(0, 10)
                  .forEach((result: any, idx: number) => {
                    fallbackContent += `${idx + 1}. **${result.title || result.id}**\n`;
                    if (result.text) fallbackContent += `   ${result.text}\n`;
                    if (result.url) fallbackContent += `   🔗 ${result.url}\n`;
                    fallbackContent += '\n';
                  });
              }
            } catch {
              // If not JSON, just show the text
              fallbackContent += `${index + 1}. ${item.text.substring(0, 200)}...\n\n`;
            }
          } else if (item.title) {
            // Standard result format
            fallbackContent += `${index + 1}. **${item.title}**\n`;
            if (item.abstract) fallbackContent += `   ${item.abstract.substring(0, 200)}...\n`;
            if (item.pmid) fallbackContent += `   📄 PMID: ${item.pmid}\n`;
            if (item.url) fallbackContent += `   🔗 ${item.url}\n`;
            fallbackContent += '\n';
          }
        });
      } catch (formatError) {
        console.error('Error formatting fallback:', formatError);
        fallbackContent += '\nUne erreur s\'est produite lors du formatage des résultats.';
      }

      return {
        content: fallbackContent,
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
