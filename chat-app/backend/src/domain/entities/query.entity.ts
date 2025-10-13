import { generateUUID } from '../../shared/utils/uuid.util';
import { QueryTextVO } from '../value-objects';

/**
 * Query type
 * @description This enum is used to represent the type of query.
 */
export enum QueryType {
  LITERATURE_SEARCH = 'literature_search',
  CLINICAL_TRIALS = 'clinical_trials',
  GENETIC_VARIANTS = 'genetic_variants',
  DRUG_INTERACTIONS = 'drug_interactions',
  GENERAL_BIOMEDICAL = 'general_biomedical',
}

/**
 * Query parameters
 * @description This interface is used to represent the parameters of a query.
 */
export interface QueryParameters {
  readonly query: string;
  readonly domain: string;
  readonly page_size: number;
  readonly genes: string[];
  readonly diseases: string[];
  readonly variants: string[];
  readonly keywords: string[];
  readonly [key: string]: any;
}

/**
 * Query entity
 * @description This class is used to represent a query.
 */
export class QueryEntity {
  private constructor(
    private readonly _id: string,
    private readonly _text: QueryTextVO,
    private readonly _type: QueryType,
    private readonly _parameters: QueryParameters,
    private readonly _createdAt: Date,
  ) {
    this.validate();
  }

  /**
   * Create a query
   * @param text - The text of the query
   * @param type - The type of the query
   * @param parameters - The parameters of the query
   * @returns The query
   */
  static create(
    text: string,
    type: QueryType,
    parameters: QueryParameters,
  ): QueryEntity {
    return new QueryEntity(
      generateUUID(),
      QueryTextVO.create(text),
      type,
      parameters,
      new Date(),
    );
  }

  /**
   * Create a query from an analysis result
   * @param text - The text of the query
   * @param analysisResult - The analysis result
   * @returns The query
   */
  static fromAnalysisResult(
    text: string,
    analysisResult: {
      type: string;
      parameters: QueryParameters;
    },
  ): QueryEntity {
    const queryType = QueryEntity.mapStringToQueryType(analysisResult.type);

    return new QueryEntity(
      generateUUID(),
      QueryTextVO.create(text),
      queryType,
      analysisResult.parameters,
      new Date(),
    );
  }

  /**
   * Get the ID of the query
   * @returns The ID of the query
   */
  get id(): string {
    return this._id;
  }

  /**
   * Get the text of the query
   * @returns The text of the query
   */
  get text(): QueryTextVO {
    return this._text;
  }

  /**
   * Get the type of the query
   * @returns The type of the query
   */
  get type(): QueryType {
    return this._type;
  }

  /**
   * Get the parameters of the query
   * @returns The parameters of the query
   */
  get parameters(): QueryParameters {
    return this._parameters;
  }

  /**
   * Get the created at date of the query
   * @returns The created at date of the query
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * Check if the query is a literature search
   * @returns True if the query is a literature search, false otherwise
   */
  isLiteratureSearch(): boolean {
    return this._type === QueryType.LITERATURE_SEARCH;
  }

  /**
   * Check if the query is a clinical trials
   * @returns True if the query is a clinical trials, false otherwise
   */
  isClinicalTrials(): boolean {
    return this._type === QueryType.CLINICAL_TRIALS;
  }

  /**
   * Check if the query is a genetic variants
   * @returns True if the query is a genetic variants, false otherwise
   */
  isGeneticVariants(): boolean {
    return this._type === QueryType.GENETIC_VARIANTS;
  }

  /**
   * Check if the query is a drug interactions
   * @returns True if the query is a drug interactions, false otherwise
   */
  isDrugInteractions(): boolean {
    return this._type === QueryType.DRUG_INTERACTIONS;
  }

  /**
   * Check if the query is a general biomedical
   * @returns True if the query is a general biomedical, false otherwise
   */
  isGeneralBiomedical(): boolean {
    return this._type === QueryType.GENERAL_BIOMEDICAL;
  }

  /**
   * Check if the query has genes
   * @returns True if the query has genes, false otherwise
   */
  hasGenes(): boolean {
    return this._parameters.genes.length > 0;
  }

  /**
   * Check if the query has diseases
   * @returns True if the query has diseases, false otherwise
   */
  hasDiseases(): boolean {
    return this._parameters.diseases.length > 0;
  }

  /**
   * Check if the query has variants
   * @returns True if the query has variants, false otherwise
   */
  hasVariants(): boolean {
    return this._parameters.variants.length > 0;
  }

  /**
   * Get the page size of the query
   * @returns The page size of the query
   */
  getPageSize(): number {
    return this._parameters.page_size;
  }

  /**
   * Get the domain of the query
   * @returns The domain of the query
   */
  getDomain(): string {
    return this._parameters.domain;
  }

  /**
   * Convert the query to primitives
   * @returns The primitives of the query
   */
  toPrimitives(): {
    id: string;
    text: string;
    type: string;
    parameters: QueryParameters;
    createdAt: Date;
  } {
    return {
      id: this._id,
      text: this._text.toString(),
      type: this._type,
      parameters: this._parameters,
      createdAt: this._createdAt,
    };
  }

  /**
   * Map a string to a query type
   * @param type - The string to map
   * @returns The query type
   */
  private static mapStringToQueryType(type: string): QueryType {
    switch (type.toLowerCase()) {
      case 'literature':
      case 'literature_search':
      case 'papers':
      case 'pubmed':
      case 'article':
        return QueryType.LITERATURE_SEARCH;
      case 'clinical_trials':
      case 'trials':
      case 'trial':
        return QueryType.CLINICAL_TRIALS;
      case 'genetic_variants':
      case 'genetic':
      case 'variants':
      case 'genes':
      case 'variant':
        return QueryType.GENETIC_VARIANTS;
      case 'drug_interactions':
      case 'drug':
      case 'interactions':
        return QueryType.DRUG_INTERACTIONS;
      default:
        return QueryType.GENERAL_BIOMEDICAL;
    }
  }

  /**
   * Validate the query
   */
  private validate(): void {
    if (!this._id || this._id.length === 0) {
      throw new Error('Query ID cannot be empty');
    }

    if (!this._parameters.query || this._parameters.query.length === 0) {
      throw new Error('Query parameters must include a query string');
    }

    if (this._parameters.page_size <= 0 || this._parameters.page_size > 100) {
      throw new Error('Page size must be between 1 and 100');
    }
  }
}
