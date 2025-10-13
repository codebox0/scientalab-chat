import { QueryTextVO } from '../value-objects';

/**
 * Biomedical analysis result
 * @description This interface is used to represent the result of the biomedical analysis.
 */
export interface BiomedicalAnalysisResult {
  readonly type: 'literature' | 'trial' | 'variant' | 'drug' | 'general';
  readonly confidence: number;
  readonly keywords: string[];
  readonly entities: {
    genes: string[];
    diseases: string[];
    variants: string[];
    drugs: string[];
  };
  readonly parameters: {
    query: string;
    domain: string;
    page_size: number;
    genes: string[];
    diseases: string[];
    variants: string[];
    keywords: string[];
  };
}

/**
 * Biomedical analyzer service
 * @description This service is used to analyze the biomedical query.
 */
export class BiomedicalAnalyzerService {
  /**
   * Analyze query
   * @param queryText - The query text
   * @returns The analysis result
   */
  analyzeQuery(queryText: QueryTextVO): BiomedicalAnalysisResult {
    const keywords = queryText.extractKeywords();
    const queryType = queryText.detectQueryType();

    // Extract entities
    const entities = this.extractEntities(queryText.getValue());

    // Calculate confidence based on keyword density and specificity
    const confidence = this.calculateConfidence(queryText, keywords, queryType);

    // Generate parameters for BioMCP
    const parameters = this.generateParameters(queryText, queryType, entities);

    return {
      type: queryType,
      confidence,
      keywords,
      entities,
      parameters,
    };
  }

  /**
   * Extract entities from text
   * @param text - The text
   * @returns The entities
   */
  private extractEntities(text: string): {
    genes: string[];
    diseases: string[];
    variants: string[];
    drugs: string[];
  } {
    const patterns = {
      genes: /\b[A-Z]{2,}[A-Z0-9]*\b/g,
      variants: /\brs\d+\b/g,
      diseases:
        /\b(cancer|diabetes|melanoma|ibd|crohn|colitis|arthritis|alzheimer|parkinson|epilepsy|asthma)\b/g,
      drugs:
        /\b(adalimumab|pembrolizumab|infliximab|methotrexate|aspirin|acetaminophen|ibuprofen|prednisone)\b/g,
    };

    return {
      genes: (text.match(patterns.genes) || []).slice(0, 5),
      diseases: (text.match(patterns.diseases) || []).slice(0, 3),
      variants: (text.match(patterns.variants) || []).slice(0, 3),
      drugs: (text.match(patterns.drugs) || []).slice(0, 3),
    };
  }

  /**
   * Calculate confidence based on keyword density and specificity
   * @param queryText - The query text
   * @param keywords - The keywords
   * @param queryType - The query type
   * @returns The confidence
   */
  private calculateConfidence(
    queryText: QueryTextVO,
    keywords: string[],
    queryType: string,
  ): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on keyword count
    confidence += Math.min(keywords.length * 0.1, 0.3);

    // Increase confidence for specific query types
    if (queryType !== 'general') {
      confidence += 0.2;
    }

    // Increase confidence for longer, more specific queries
    if (queryText.length() > 50) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Generate parameters for BioMCP
   * @param queryText - The query text
   * @param queryType - The query type
   * @param entities - The entities
   * @returns The parameters
   */
  private generateParameters(
    queryText: QueryTextVO,
    queryType: string,
    entities: {
      genes: string[];
      diseases: string[];
      variants: string[];
      drugs: string[];
    },
  ): {
    query: string;
    domain: string;
    page_size: number;
    genes: string[];
    diseases: string[];
    variants: string[];
    keywords: string[];
  } {
    const domain = this.mapQueryTypeToDomain(queryType);

    return {
      query: queryText.getValue(),
      domain,
      page_size: 10,
      genes: entities.genes,
      diseases: entities.diseases,
      variants: entities.variants,
      keywords: [queryText.getValue()],
    };
  }

  /**
   * Map query type to domain
   * @param queryType - The query type
   * @returns The domain
   */
  private mapQueryTypeToDomain(queryType: string): string {
    switch (queryType) {
      case 'literature':
        return 'article';
      case 'trial':
        return 'trial';
      case 'variant':
        return 'variant';
      case 'drug':
        return 'article'; // Drug info often in literature
      default:
        return 'article';
    }
  }
}
