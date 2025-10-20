/**
 * Query text value object
 * @description This class is used to represent a query text.
 */
export class QueryTextVO {
  private constructor(private readonly value: string) {
    this.validate();
  }

  /**
   * Create a query text value object
   * @param text - The text to create a query text value object for
   * @returns The query text value object
   */
  static create(text: string): QueryTextVO {
    return new QueryTextVO(text.trim());
  }

  /**
   * Get the value of the query text
   * @returns The value of the query text
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Check if the query text is empty
   * @returns True if the query text is empty, false otherwise
   */
  isEmpty(): boolean {
    return this.value.length === 0;
  }

  /**
   * Get the length of the query text
   * @returns The length of the query text
   */
  length(): number {
    return this.value.length;
  }

  /**
   * Check if the query text contains a keyword
   * @param keyword - The keyword to check for
   * @returns True if the query text contains a keyword, false otherwise
   */
  contains(keyword: string): boolean {
    return this.value.toLowerCase().includes(keyword.toLowerCase());
  }

  /**
   * Convert the query text to lowercase
   * @returns The query text in lowercase
   */
  toLowerCase(): string {
    return this.value.toLowerCase();
  }

  /**
   * Extract keywords from the query text
   * @returns The keywords extracted from the query text
   */
  extractKeywords(): string[] {
    // Extract biomedical keywords using regex patterns
    const patterns = {
      genes: /\b[A-Z]{2,}[A-Z0-9]*\b/g,
      variants: /\brs\d+\b/g,
      diseases:
        /\b(cancer|diabetes|melanoma|ibd|crohn|colitis|arthritis|alzheimer|parkinson)\b/g,
      drugs: /\b(adalimumab|pembrolizumab|infliximab|methotrexate|aspirin)\b/g,
    };

    const keywords: string[] = [];

    Object.values(patterns).forEach((pattern) => {
      const matches = this.value.match(pattern);
      if (matches) {
        keywords.push(...matches);
      }
    });

    return [...new Set(keywords)]; // Remove duplicates
  }

  /**
   * Detect the query type with enhanced multi-language support
   * @returns The query type
   */
  detectQueryType(): 'literature' | 'trial' | 'variant' | 'drug' | 'general' {
    const lowercaseValue = this.toLowerCase();

    // Priority 1: Genetic variants (highest specificity)
    // Check for rs identifiers, specific mutation patterns
    if (
      /\brs\d+\b/.test(lowercaseValue) ||
      this.contains('variant') ||
      this.contains('mutation') ||
      this.contains('snp') ||
      this.contains('polymorphism') ||
      this.contains('allele') ||
      this.contains('genotype') ||
      this.contains('genetic variant') ||
      /\b[A-Z]\d+[A-Z]\b/.test(this.value) || // e.g., V600E
      this.contains('dbsnp')
    ) {
      return 'variant';
    }

    // Priority 2: Clinical trials (very specific keywords)
    // English + French keywords
    if (
      this.contains('clinical trial') ||
      this.contains('essai clinique') ||
      this.contains('essai') ||
      this.contains('trial') ||
      this.contains('phase i') ||
      this.contains('phase ii') ||
      this.contains('phase iii') ||
      this.contains('phase iv') ||
      this.contains('randomized') ||
      this.contains('randomis') ||
      this.contains('placebo') ||
      this.contains('nct') ||
      this.contains('clinicaltrials.gov') ||
      this.contains('intervention') ||
      this.contains('recruitment') ||
      this.contains('recrutement') ||
      this.contains('study protocol') ||
      this.contains('protocole')
    ) {
      return 'trial';
    }

    // Priority 3: Drug/medication queries
    // English + French keywords
    if (
      this.contains('drug interaction') ||
      this.contains('medication') ||
      this.contains('medicament') ||
      this.contains('médicament') ||
      this.contains('therapeutic') ||
      this.contains('thérapeutique') ||
      this.contains('treatment') ||
      this.contains('traitement') ||
      this.contains('inhibitor') ||
      this.contains('inhibiteur') ||
      this.contains('antibody') ||
      this.contains('anticorps') ||
      this.contains('pharmacology') ||
      this.contains('pharmacologie') ||
      this.contains('side effect') ||
      this.contains('effet secondaire') ||
      this.contains('dosage') ||
      this.contains('posologie')
    ) {
      return 'drug';
    }

    // Priority 4: Literature search (most common, lower priority)
    // English + French keywords
    if (
      this.contains('paper') ||
      this.contains('article') ||
      this.contains('publication') ||
      this.contains('study') ||
      this.contains('étude') ||
      this.contains('literature') ||
      this.contains('littérature') ||
      this.contains('research') ||
      this.contains('recherche') ||
      this.contains('pubmed') ||
      this.contains('abstract') ||
      this.contains('résumé') ||
      this.contains('review') ||
      this.contains('revue') ||
      this.contains('meta-analysis') ||
      this.contains('meta-analyse') ||
      this.contains('systematic review') ||
      this.contains('find papers') ||
      this.contains('trouve') ||
      this.contains('cherche')
    ) {
      return 'literature';
    }

    // Default: General biomedical query
    // Will use LLM without specific biomedical data
    return 'general';
  }

  /**
   * Check if the query text is equal to another query text
   * @param other - The other query text
   * @returns True if the query text is equal to another query text, false otherwise
   */
  equals(other: QueryTextVO): boolean {
    return this.value === other.value;
  }

  /**
   * Convert the query text to a string
   * @returns The string representation of the query text
   */
  toString(): string {
    return this.value;
  }

  /**
   * Validate the query text
   */
  private validate(): void {
    if (this.value.length === 0) {
      throw new Error('Query text cannot be empty');
    }

    if (this.value.length > 1000) {
      throw new Error('Query text is too long (max 1000 characters)');
    }
  }
}
