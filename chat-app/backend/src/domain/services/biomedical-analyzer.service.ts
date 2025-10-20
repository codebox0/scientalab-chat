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
   * Extract entities from text with enhanced biomedical patterns
   * @param text - The text
   * @returns The entities
   */
  private extractEntities(text: string): {
    genes: string[];
    diseases: string[];
    variants: string[];
    drugs: string[];
  } {
    const lowercaseText = text.toLowerCase();

    // Enhanced patterns for better entity extraction
    const patterns = {
      // Gene symbols: 2+ uppercase letters, followed by optional numbers
      // Examples: TP53, BRCA1, TNF, IL6
      genes: /\b[A-Z]{2,}[A-Z0-9]*\b/g,

      // Genetic variants: rs identifiers and mutation notations
      // Examples: rs113488022, V600E, R273H
      variants: /\b(rs\d+|[A-Z]\d+[A-Z])\b/g,

      // Comprehensive disease list (English + French terms)
      diseases: new RegExp(
        '\\b(' +
          [
            // Cancers
            'cancer',
            'carcinoma',
            'carcinome',
            'melanoma',
            'mélanome',
            'leukemia',
            'leucémie',
            'lymphoma',
            'lymphome',
            'sarcoma',
            'sarcome',
            'glioma',
            'gliome',
            'breast cancer',
            'cancer du sein',
            'lung cancer',
            'cancer du poumon',
            'ovarian cancer',
            'cancer ovarien',
            // Inflammatory diseases
            'ibd',
            'inflammatory bowel disease',
            'maladie inflammatoire',
            "crohn's disease",
            'crohn',
            'maladie de crohn',
            'colitis',
            'colite',
            'ulcerative colitis',
            'rectocolite',
            'arthritis',
            'arthrite',
            'rheumatoid arthritis',
            'polyarthrite',
            // Neurological
            "alzheimer's",
            'alzheimer',
            "parkinson's",
            'parkinson',
            'epilepsy',
            'épilepsie',
            'multiple sclerosis',
            'sclérose en plaques',
            'stroke',
            'avc',
            // Metabolic
            'diabetes',
            'diabète',
            'obesity',
            'obésité',
            'metabolic syndrome',
            'syndrome métabolique',
            // Respiratory
            'asthma',
            'asthme',
            'copd',
            'bpco',
            'pneumonia',
            'pneumonie',
            // Cardiovascular
            'hypertension',
            'heart failure',
            'insuffisance cardiaque',
            'coronary',
            'coronarien',
            // Other
            'depression',
            'dépression',
            'schizophrenia',
            'schizophrénie',
            'autism',
            'autisme',
          ].join('|') +
          ')\\b',
        'gi',
      ),

      // Comprehensive drug list (generic names + brand names)
      drugs: new RegExp(
        '\\b(' +
          [
            // TNF inhibitors
            'adalimumab',
            'humira',
            'infliximab',
            'remicade',
            'etanercept',
            'enbrel',
            'golimumab',
            'simponi',
            'certolizumab',
            'cimzia',
            // Immunotherapy
            'pembrolizumab',
            'keytruda',
            'nivolumab',
            'opdivo',
            'atezolizumab',
            'tecentriq',
            'ipilimumab',
            'yervoy',
            // Chemotherapy
            'methotrexate',
            'cisplatin',
            'carboplatin',
            'paclitaxel',
            'taxol',
            'doxorubicin',
            'adriamycin',
            '5-fluorouracil',
            '5-fu',
            // Pain/Inflammation
            'aspirin',
            'aspirine',
            'ibuprofen',
            'advil',
            'naproxen',
            'acetaminophen',
            'paracetamol',
            'tylenol',
            // Corticosteroids
            'prednisone',
            'prednisolone',
            'dexamethasone',
            'hydrocortisone',
            'methylprednisolone',
            // Antibiotics
            'amoxicillin',
            'amoxicilline',
            'azithromycin',
            'ciprofloxacin',
            'doxycycline',
            // Anticoagulants
            'warfarin',
            'coumadin',
            'heparin',
            'héparine',
            'rivaroxaban',
            'xarelto',
            'apixaban',
            'eliquis',
            // Statins
            'atorvastatin',
            'lipitor',
            'simvastatin',
            'rosuvastatin',
            'crestor',
            // Diabetes
            'metformin',
            'metformine',
            'insulin',
            'insuline',
            'glipizide',
            // Targeted therapy
            'trastuzumab',
            'herceptin',
            'bevacizumab',
            'avastin',
            'rituximab',
            'rituxan',
          ].join('|') +
          ')\\b',
        'gi',
      ),
    };

    // Extract and deduplicate entities
    const extractAndDeduplicate = (pattern: RegExp, maxCount: number) => {
      const matches = text.match(pattern) || [];
      return [...new Set(matches)].slice(0, maxCount);
    };

    return {
      genes: extractAndDeduplicate(patterns.genes, 5),
      variants: extractAndDeduplicate(patterns.variants, 5),
      diseases: extractAndDeduplicate(patterns.diseases, 5),
      drugs: extractAndDeduplicate(patterns.drugs, 5),
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
